import {
  getEvmTreasuryRecipient,
  PaymentServiceError,
} from "../../artifacts/api-server/src/lib/payment-service";

interface ApiRequest {
  method?: string;
}

interface ApiResponse {
  setHeader(name: string, value: string): void;
  status(statusCode: number): ApiResponse;
  json(body: unknown): ApiResponse;
}

export default function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    return res.status(200).json({ recipient: getEvmTreasuryRecipient() });
  } catch (error) {
    if (error instanceof PaymentServiceError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "The payment service encountered an unexpected error." });
  }
}
