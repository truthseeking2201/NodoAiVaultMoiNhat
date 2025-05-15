export const formatCurrency = (
  value: number | string,
  decimal: number | string
) => {
  const decimalNum = Number(decimal ?? 0);
  const currencyValue = Number(value) / Math.pow(10, decimalNum);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(currencyValue);
};
