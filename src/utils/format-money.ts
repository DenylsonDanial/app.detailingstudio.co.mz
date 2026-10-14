export function formatMoney(value?: number | string | null, symbol = 'MT'): string {
  const amount = Number(value || 0);
  const formatted = new Intl.NumberFormat('pt-MZ', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `${formatted} ${symbol}`;
}

export function formatDatePt(value?: string | null): string {
  if (!value) return '—';
  const date = value.length <= 10 ? new Date(`${value}T00:00:00`) : new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('pt-PT');
}

export function toIsoDate(date: Date | null | undefined): string {
  if (!date || Number.isNaN(date.getTime())) {
    return '';
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayIso(): string {
  return toIsoDate(new Date());
}

export function plusDaysIso(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

export function linePreview(item: {
  quantity?: number;
  unitPrice?: number;
  discount?: number;
  taxRate?: number;
}): { net: number; tax: number; total: number } {
  const qty = Number(item.quantity || 0);
  const price = Number(item.unitPrice || 0);
  const discount = Number(item.discount || 0);
  const rate = Number(item.taxRate || 0);
  const net = Math.max(qty * price - discount, 0);
  const tax = (net * rate) / 100;
  return { net, tax, total: net + tax };
}
