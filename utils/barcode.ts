/**
 * Calculates the EAN-13 check digit from the first 12 digits.
 * Uses alternating weights 1 and 3.
 */
function calcCheckDigit(digits: number[]): number {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += digits[i] * (i % 2 === 0 ? 1 : 3);
  }
  return (10 - (sum % 10)) % 10;
}

/**
 * Generates a random valid EAN-13 barcode.
 * Produces 12 random digits plus a computed check digit.
 */
export function generateEAN13(): string {
  const digits: number[] = Array.from({ length: 12 }, () =>
    Math.floor(Math.random() * 10),
  );
  const check = calcCheckDigit(digits);
  return [...digits, check].join("");
}

/**
 * Validates whether a 13-character string is a valid EAN-13 barcode.
 */
export function validateEAN13(barcode: string): boolean {
  if (!/^\d{13}$/.test(barcode)) return false;
  const digits = barcode.split("").map(Number);
  return calcCheckDigit(digits.slice(0, 12)) === digits[12];
}
