/**
 * On-chain SVM transaction verification.
 *
 * Queries the chain's JSON-RPC endpoint to confirm that a given transaction:
 *  1. Exists on-chain (finalized commitment)
 *  2. Did not fail on-chain (meta.err === null)
 *  3. Has the treasury address among its account keys with a positive balance delta
 *  4. (Optional) Sent at least `minLamports` to that treasury address
 *
 * Works for any SVM-compatible chain (Solana mainnet, X1, etc.)
 * as long as the RPC implements the standard `getTransaction` method.
 */

export type SvmVerifyReason =
  | "not_found"
  | "not_finalized"
  | "tx_failed"
  | "wrong_recipient"
  | "insufficient_amount"
  | "rpc_error";

export type SvmVerifyResult =
  | { ok: true }
  | { ok: false; reason: SvmVerifyReason; message: string };

/**
 * Verify a Solana/X1 payment transaction on-chain.
 *
 * @param sig             Base58 transaction signature (87-88 chars)
 * @param rpcUrl          JSON-RPC endpoint for the target chain
 * @param treasuryAddress Expected recipient address (base58 pubkey)
 * @param minLamports     Minimum lamports treasury must have received.
 *                        Pass 0 to skip the amount check (e.g. when native
 *                        token price is unavailable).
 */
export async function verifySvmPayment(
  sig: string,
  rpcUrl: string,
  treasuryAddress: string,
  minLamports: number = 0,
): Promise<SvmVerifyResult> {
  // ── 1. Fetch transaction from RPC ─────────────────────────────────────────
  let data: any;
  try {
    const res = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getTransaction",
        params: [
          sig.trim(),
          {
            encoding: "json",
            commitment: "finalized",
            maxSupportedTransactionVersion: 0,
          },
        ],
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    data = await res.json();
  } catch (err: any) {
    return {
      ok: false,
      reason: "rpc_error",
      message:
        "Could not reach the chain RPC. Check your connection and try again.",
    };
  }

  if (data?.error) {
    return {
      ok: false,
      reason: "rpc_error",
      message: `RPC error: ${data.error.message ?? JSON.stringify(data.error)}`,
    };
  }

  const tx = data?.result;

  // ── 2. Existence check ────────────────────────────────────────────────────
  if (tx === null || tx === undefined) {
    return {
      ok: false,
      reason: "not_found",
      message:
        "Transaction not found on-chain. It may still be pending — " +
        "wait for finalization (usually 30–60 s) and try again.",
    };
  }

  // ── 3. On-chain success check ─────────────────────────────────────────────
  //    meta.err is null for successful transactions, an object for failures.
  const txErr = tx.meta?.err;
  if (txErr !== null && txErr !== undefined) {
    return {
      ok: false,
      reason: "tx_failed",
      message:
        "This transaction failed on-chain. Please send a new transaction and paste that signature instead.",
    };
  }

  // ── 4. Treasury recipient check ───────────────────────────────────────────
  const accountKeys: string[] =
    tx.transaction?.message?.accountKeys ?? [];
  const treasuryIdx = accountKeys.findIndex(
    (k: string) => k === treasuryAddress,
  );

  if (treasuryIdx === -1) {
    return {
      ok: false,
      reason: "wrong_recipient",
      message:
        `Treasury address not found in this transaction. ` +
        `Please send to ${treasuryAddress.slice(0, 8)}…${treasuryAddress.slice(-6)} ` +
        `and paste the new signature.`,
    };
  }

  // Confirm treasury balance increased (net positive transfer)
  const preBalances: number[] = tx.meta?.preBalances ?? [];
  const postBalances: number[] = tx.meta?.postBalances ?? [];
  const received = (postBalances[treasuryIdx] ?? 0) - (preBalances[treasuryIdx] ?? 0);

  if (received <= 0) {
    return {
      ok: false,
      reason: "wrong_recipient",
      message:
        "Treasury balance did not increase in this transaction. " +
        "Ensure you're sending funds to the correct address.",
    };
  }

  // ── 5. Amount check (optional) ────────────────────────────────────────────
  if (minLamports > 0 && received < minLamports) {
    const receivedNative = (received / 1e9).toFixed(4);
    const expectedNative = (minLamports / 1e9).toFixed(4);
    return {
      ok: false,
      reason: "insufficient_amount",
      message:
        `Insufficient payment: received ${receivedNative} but needed at least ` +
        `${expectedNative} (includes 5% slippage buffer). Please send the full fee.`,
    };
  }

  return { ok: true };
}
