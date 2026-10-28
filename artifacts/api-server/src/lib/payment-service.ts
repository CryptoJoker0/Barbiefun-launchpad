export type SvmNetwork = "x1" | "solana";

export type SvmVerifyResult =
  | { ok: true }
  | {
      ok: false;
      reason: "not_found" | "tx_failed" | "wrong_recipient" | "insufficient_amount";
      message: string;
    };

export class PaymentServiceError extends Error {
  constructor(
    readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "PaymentServiceError";
  }
}

const EVM_ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/;
const SVM_ADDRESS_PATTERN = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const SVM_SIGNATURE_PATTERN = /^[1-9A-HJ-NP-Za-km-z]{87,88}$/;

const SVM_RPC_URLS: Record<SvmNetwork, string> = {
  x1: "https://rpc.x1.xyz",
  solana: "https://api.mainnet-beta.solana.com",
};

export function getEvmTreasuryRecipient(): string {
  const recipient = process.env.TREASURY_EVM_ADDRESS?.trim();

  if (!recipient || !EVM_ADDRESS_PATTERN.test(recipient)) {
    throw new PaymentServiceError(503, "EVM payment recipient is not configured.");
  }

  return recipient;
}

export async function verifySvmPaymentOnServer(input: unknown): Promise<SvmVerifyResult> {
  const body =
    typeof input === "object" && input !== null ? (input as Record<string, unknown>) : {};
  const network = body.network;
  const signature = typeof body.signature === "string" ? body.signature.trim() : "";
  const minLamports = Number(body.minLamports ?? 0);

  if (network !== "x1" && network !== "solana") {
    throw new PaymentServiceError(400, "Choose a supported SVM network.");
  }

  if (!SVM_SIGNATURE_PATTERN.test(signature)) {
    throw new PaymentServiceError(400, "Enter a valid transaction signature.");
  }

  if (!Number.isSafeInteger(minLamports) || minLamports < 0) {
    throw new PaymentServiceError(400, "The minimum payment amount is invalid.");
  }

  const recipient = process.env.TREASURY_SVM_ADDRESS?.trim();
  if (!recipient || !SVM_ADDRESS_PATTERN.test(recipient)) {
    throw new PaymentServiceError(503, "SVM payment recipient is not configured.");
  }

  let payload: unknown;
  try {
    const response = await fetch(SVM_RPC_URLS[network], {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getTransaction",
        params: [
          signature,
          {
            encoding: "json",
            commitment: "finalized",
            maxSupportedTransactionVersion: 0,
          },
        ],
      }),
      signal: AbortSignal.timeout(8_000),
    });

    if (!response.ok) throw new Error("SVM RPC request failed");
    payload = await response.json();
  } catch {
    throw new PaymentServiceError(502, "Could not reach the chain RPC. Try again shortly.");
  }

  if (!payload || typeof payload !== "object") {
    throw new PaymentServiceError(502, "The chain RPC returned an invalid response.");
  }

  const rpcPayload = payload as { error?: unknown; result?: unknown };
  if (rpcPayload.error) {
    throw new PaymentServiceError(502, "The chain RPC rejected the transaction lookup.");
  }

  const transaction = rpcPayload.result;
  if (!transaction || typeof transaction !== "object") {
    return {
      ok: false,
      reason: "not_found",
      message:
        "Transaction not found on-chain. It may still be pending — wait for finalization and try again.",
    };
  }

  const details = transaction as {
    meta?: {
      err?: unknown;
      preBalances?: unknown[];
      postBalances?: unknown[];
    };
    transaction?: {
      message?: { accountKeys?: unknown[] };
    };
  };

  if (details.meta?.err != null) {
    return {
      ok: false,
      reason: "tx_failed",
      message: "This transaction failed on-chain. Please send a new transaction and try again.",
    };
  }

  const rawAccountKeys = Array.isArray(details.transaction?.message?.accountKeys)
    ? details.transaction.message.accountKeys
    : [];
  const accountKeys = rawAccountKeys
    .map((key) => (typeof key === "string" ? key : (key as { pubkey?: string })?.pubkey))
    .filter((key): key is string => typeof key === "string");
  const recipientIndex = accountKeys.indexOf(recipient);

  if (recipientIndex === -1) {
    return {
      ok: false,
      reason: "wrong_recipient",
      message: "Payment recipient could not be verified. Confirm the payment details and try again.",
    };
  }

  const before = Number(details.meta?.preBalances?.[recipientIndex] ?? 0);
  const after = Number(details.meta?.postBalances?.[recipientIndex] ?? 0);
  const received = after - before;

  if (!Number.isFinite(received) || received <= 0) {
    return {
      ok: false,
      reason: "wrong_recipient",
      message: "The recipient balance did not increase in this transaction.",
    };
  }

  if (minLamports > 0 && received < minLamports) {
    return {
      ok: false,
      reason: "insufficient_amount",
      message: "The payment was below the required amount. Please send the full fee and try again.",
    };
  }

  return { ok: true };
}
