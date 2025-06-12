export const truncateStringWithSeparator = (
  strVal: string | null | undefined,
  length: number,
  separator: string | null | undefined,
  frontCharsLength: number
) => {
  const str = `${strVal}`;

  if (!length || str.length <= length) return str;

  separator = separator || "...";

  const sepLen = separator.length;
  const charsToShow = length - sepLen;
  let frontChars = 0;
  let backChars = 0;

  if (frontCharsLength > 0) {
    frontChars = frontCharsLength;
    backChars = charsToShow - frontChars;
  } else {
    frontChars = Math.ceil(charsToShow / 2);
    backChars = Math.floor(charsToShow / 2);
  }

  return (
    str.substr(0, frontChars) + separator + str.substr(str.length - backChars)
  );
};

/**
 * Calculates the interest based on APR and principal amount
 * @param {number} principal - The principal amount
 * @param {number} apr - Annual Percentage Rate (as a percentage, e.g., 18.7)
 * @param {number} years - Number of years (default: 1)
 * @returns {number} The interest amount
 */
export const calculateInterest = (
  principal: number,
  apr: number,
  years = 1
) => {
  // Convert APR from percentage to decimal
  const aprDecimal = apr / 100;

  // Calculate interest
  const interest = principal * aprDecimal * years;

  // Return the interest rounded to 2 decimal places
  return Math.round(interest * 100) / 100;
};
