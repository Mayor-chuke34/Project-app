export function formatNaira(amount) {
  const num = Number(amount) || 0;
  // Round to nearest Naira (no kobo shown)
  const rounded = Math.round(num);
  return rounded.toLocaleString('en-NG');
}

export function formatPriceDisplay(amount) {
  return `₦${formatNaira(amount)}`;
}
