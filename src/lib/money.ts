/**
 * Utilities for formatting money in FCFA (XOF).
 * Amounts are stored as integers (no decimals) since FCFA has no subunit in practice.
 */

export function formatFCFA(amount: number): string {
  const n = Math.round(amount || 0);
  // Group thousands with non-breaking space for better readability in French
  const withGroups = n.toLocaleString("fr-FR").replace(/\u202f/g, "\u00a0");
  return `${withGroups}\u00a0FCFA`;
}

export function formatFCFAShort(amount: number): string {
  const n = Math.round(amount || 0);
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M\u00a0FCFA`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k\u00a0FCFA`;
  return formatFCFA(n);
}
