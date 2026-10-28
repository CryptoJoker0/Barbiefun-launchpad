import {
  PaymentServiceError,
  verifySvmPaymentOnServer,
} from "../../artifacts/api-server/src/lib/payment-service";

interface ApiRequest {
  method?: string;
  body?: unknown;
}

interface ApiResponse {
  setHeader(name: string, value: string): void;
  status(statusCode: number): ApiResponse;
  json(body: unknown): ApiResponse;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    return res.status(200).json(await verifySvmPaymentOnServer(req.body));
  } catch (error) {
    if (error instanceof PaymentServiceError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "The payment service encountered an unexpected error." });
  }
}
