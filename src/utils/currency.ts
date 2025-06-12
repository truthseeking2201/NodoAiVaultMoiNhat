export const formatCurrency = (
  value: number | string,
  decimal: number | string = 0,
  minimumFractionDigits: number = 0,
  maximumFractionDigits: number = 2,
  style: "currency" | "decimal" = "decimal",
  currency: string = "USD"
) => {
  const decimalNum = Number(decimal ?? 0);
  const currencyValue = Number(value) / Math.pow(10, decimalNum);
  if (style === "decimal") {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(currencyValue);
  }
  return new Intl.NumberFormat("en-US", {
    style,
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(currencyValue);
};
