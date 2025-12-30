
// web/src/utils/isbn.ts
export function isValidIsbn13(s: string): boolean {
  const digits = s.replace(/[^0-9]/g, '');
  if (digits.length !== 13) return false;
  const sum = digits
    .slice(0, 12)
    .split('')
    .map(Number)
    .reduce((acc, d, i) => acc + d * (i % 2 ? 3 : 1), 0);
  const check = (10 - (sum % 10)) % 10;
  return check === Number(digits[12]);
}

export function isbn10to13(isbn10: string): string {
  const s = isbn10.replace(/[^0-9Xx]/g, '').toUpperCase();
  if (s.length !== 10) return '';
  const core9 = s.slice(0, 9);
  const thirteen = '978' + core9;
  const sum = thirteen
    .split('')
    .map(Number)
    .reduce((acc, d, i) => (i < 12 ? acc + d * (i % 2 ? 3 : 1) : acc), 0);
  const check = (10 - (sum % 10)) % 10;
  return thirteen + String(check);
}

export function normalizeIsbnInput(input: string): string | null {
  const raw = input.replace(/[-\s]/g, '');
  if (/^\d{13}$/.test(raw) && isValidIsbn13(raw)) return raw;
  if (/^\d{9}[\dXx]$/.test(raw)) {
    const conv = isbn10to13(raw);
    return conv && isValidIsbn13(conv) ? conv : null;
  }
  return null;
}

export function normalizeEanToIsbn13(ean: string){
  const s = (ean||'').replace(/[^0-9]/g,'');
  if (s.length !== 13) return null;
  const digits = s.split('').map(Number);
  const sum = digits.slice(0,12).reduce((acc,d,i)=> acc + d * (i%2?3:1), 0);
  const check = (10 - (sum % 10)) % 10;
  if (check !== digits[12]) return null;
  return s;
}
