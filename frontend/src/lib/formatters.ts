export function formatPercent(value: number, decimals = 0) {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
}

