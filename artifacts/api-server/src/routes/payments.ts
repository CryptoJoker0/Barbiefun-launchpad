import { Router, type Response } from "express";

const router = Router();

const EVM_ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/;
const SVM_ADDRESS_PATTERN = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const SVM_SIGNATURE_PATTERN = /^[1-9A-HJ-NP-Za-km-z]{87,88}$/;

const SVM_RPC_URLS = {
  x1: "https://rpc.x1.xyz",
  solana: "https://api.mainnet-beta.solana.com",
} as const;

type SvmNetwork = keyof typeof SVM_RPC_URLS;

type SvmVerifyResult =
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

function sendSvmResult(res: Response, result: SvmVerifyResult) {
  res.setHeader("Cache-Control", "no-store");
  res.json(result);
}

router.get("/payments/evm-recipient", (_req, res) => {
  const recipient = process.env.TREASURY_EVM_ADDRESS?.trim();

  if (!recipient || !EVM_ADDRESS_PATTERN.test(recipient)) {
    res.status(503).json({ error: "EVM payment recipient is not configured." });
    return;
  }

  res.setHeader("Cache-Control", "no-store");
  res.json({ recipient });
});

router.post("/payments/verify-svm", async (req, res) => {
  const network = req.body?.network as SvmNetwork | undefined;
  const signature = typeof req.body?.signature === "string" ? req.body.signature.trim() : "";
  const minLamports = Number(req.body?.minLamports ?? 0);

  if (network !== "x1" && network !== "solana") {
    res.status(400).json({ error: "Choose a supported SVM network." });
    return;
  }

  if (!SVM_SIGNATURE_PATTERN.test(signature)) {
    res.status(400).json({ error: "Enter a valid transaction signature." });
    return;
  }

  if (!Number.isSafeInteger(minLamports) || minLamports < 0) {
    res.status(400).json({ error: "The minimum payment amount is invalid." });
    return;
  }

  const recipient = process.env.TREASURY_SVM_ADDRESS?.trim();
  if (!recipient || !SVM_ADDRESS_PATTERN.test(recipient)) {
    res.status(503).json({ error: "SVM payment recipient is not configured." });
    return;
  }

  let payload: any;
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
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) throw new Error("SVM RPC request failed");
    payload = await response.json();
  } catch {
    res.status(502).json({ error: "Could not reach the chain RPC. Try again shortly." });
    return;
  }

  if (payload?.error) {
    res.status(502).json({ error: "The chain RPC rejected the transaction lookup." });
    return;
  }

  const transaction = payload?.result;
  if (!transaction) {
    sendSvmResult(res, {
      ok: false,
      reason: "not_found",
      message:
        "Transaction not found on-chain. It may still be pending — wait for finalization and try again.",
    });
    return;
  }

  if (transaction.meta?.err != null) {
    sendSvmResult(res, {
      ok: false,
      reason: "tx_failed",
      message: "This transaction failed on-chain. Please send a new transaction and try again.",
    });
    return;
  }

  const rawAccountKeys: unknown[] = transaction.transaction?.message?.accountKeys ?? [];
  const accountKeys = rawAccountKeys
    .map((key) => (typeof key === "string" ? key : (key as { pubkey?: string })?.pubkey))
    .filter((key): key is string => typeof key === "string");
  const recipientIndex = accountKeys.indexOf(recipient);

  if (recipientIndex === -1) {
    sendSvmResult(res, {
      ok: false,
      reason: "wrong_recipient",
      message: "Payment recipient could not be verified. Confirm the payment details and try again.",
    });
    return;
  }

  const before = Number(transaction.meta?.preBalances?.[recipientIndex] ?? 0);
  const after = Number(transaction.meta?.postBalances?.[recipientIndex] ?? 0);
  const received = after - before;

  if (received <= 0) {
    sendSvmResult(res, {
      ok: false,
      reason: "wrong_recipient",
      message: "The recipient balance did not increase in this transaction.",
    });
    return;
  }

  if (minLamports > 0 && received < minLamports) {
    sendSvmResult(res, {
      ok: false,
      reason: "insufficient_amount",
      message: "The payment was below the required amount. Please send the full fee and try again.",
    });
    return;
  }

  sendSvmResult(res, { ok: true });
});

export default router;
