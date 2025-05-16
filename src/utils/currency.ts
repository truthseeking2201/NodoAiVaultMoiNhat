export const formatCurrency = (
  value: number | string,
  decimal: number | string,
  minimumFractionDigits: number = 0,
  maximumFractionDigits: number = 2
) => {
  const decimalNum = Number(decimal ?? 0);
  const currencyValue = Number(value) / Math.pow(10, decimalNum);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(currencyValue);
};
