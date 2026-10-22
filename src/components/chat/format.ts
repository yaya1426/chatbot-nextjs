/** Formats a cost in EGP for display under a reply. */
export function formatCostEgp(cost: number): string {
  const value = Number.parseFloat(cost.toFixed(6));
  return `${value} ج.م`;
}
