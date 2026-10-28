import { Router, type Response } from "express";
import {
  getEvmTreasuryRecipient,
  PaymentServiceError,
  verifySvmPaymentOnServer,
} from "../lib/payment-service";

const router = Router();

function sendPaymentError(res: Response, error: unknown) {
  if (error instanceof PaymentServiceError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  res.status(500).json({ error: "The payment service encountered an unexpected error." });
}

router.get("/payments/evm-recipient", (_req, res) => {
  res.setHeader("Cache-Control", "no-store");

  try {
    res.json({ recipient: getEvmTreasuryRecipient() });
  } catch (error) {
    sendPaymentError(res, error);
  }
});

router.post("/payments/verify-svm", async (req, res) => {
  res.setHeader("Cache-Control", "no-store");

  try {
    res.json(await verifySvmPaymentOnServer(req.body));
  } catch (error) {
    sendPaymentError(res, error);
  }
});

export default router;
