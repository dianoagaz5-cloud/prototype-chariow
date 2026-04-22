export type PaymentProvider = "MTN_MOMO" | "MOOV_MONEY" | "CELTIIS_CASH";

export type PaymentInfo = {
  value: PaymentProvider;
  label: string;
  operator: string;
  color: string;
  prefixes: string[];
};

export const PAYMENT_PROVIDERS: PaymentInfo[] = [
  {
    value: "MTN_MOMO",
    label: "MTN Mobile Money",
    operator: "MTN",
    color: "#FFCC00",
    prefixes: ["96", "97", "66", "67", "90", "91"],
  },
  {
    value: "MOOV_MONEY",
    label: "Moov Money",
    operator: "Moov",
    color: "#0066B3",
    prefixes: ["94", "95", "98", "99", "60", "61", "62", "63"],
  },
  {
    value: "CELTIIS_CASH",
    label: "Celtiis Cash",
    operator: "Celtiis",
    color: "#FF3B3B",
    prefixes: ["42", "43", "44", "46"],
  },
];

export function getPaymentByValue(value: string | null | undefined): PaymentInfo | undefined {
  return PAYMENT_PROVIDERS.find((p) => p.value === value);
}

/**
 * Mock payment — simulates an async payment request and confirmation.
 * In production, wire this to the real provider APIs (MTN MoMo, Moov, Celtiis).
 */
export async function initiateMockPayment(params: {
  provider: PaymentProvider;
  phone: string;
  amount: number;
}): Promise<{ ok: boolean; ref: string; message: string }> {
  const info = getPaymentByValue(params.provider);
  if (!info) {
    return { ok: false, ref: "", message: "Fournisseur inconnu." };
  }
  await new Promise((r) => setTimeout(r, 600));
  const ref = `${info.operator.toUpperCase()}-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;
  return {
    ok: true,
    ref,
    message: `Paiement ${info.label} confirmé (simulation — ${ref})`,
  };
}
