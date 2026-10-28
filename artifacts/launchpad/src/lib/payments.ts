export type SvmNetwork = "x1" | "solana";

export type SvmVerifyResult =
  | { ok: true }
  | {
      ok: false;
      reason:
        | "not_found"
        | "not_finalized"
        | "tx_failed"
        | "wrong_recipient"
        | "insufficient_amount"
        | "rpc_error";
      message: string;
    };

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      typeof payload?.error === "string"
        ? payload.error
        : "The payment service is unavailable. Please try again.",
    );
  }
  return payload as T;
}

export async function getEvmTreasuryRecipient(): Promise<string> {
  const response = await fetch("/api/payments/evm-recipient", {
    cache: "no-store",
  });
  const payload = await parseResponse<{ recipient: string }>(response);

  if (typeof payload?.recipient !== "string") {
    throw new Error("The payment service returned an invalid recipient.");
  }

  return payload.recipient.trim();
}

export async function verifySvmPaymentOnServer(
  signature: string,
  network: SvmNetwork,
  minLamports = 0,
): Promise<SvmVerifyResult> {
  const response = await fetch("/api/payments/verify-svm", {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ signature, network, minLamports }),
  });

  return parseResponse<SvmVerifyResult>(response);
}
