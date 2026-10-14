import { formatMoney } from './format-money';

// ----------------------------------------------------------------------
// Datas de negocio sao sempre locais de Maputo (especificacao, seccao 9),
// independentemente do fuso do dispositivo.
// ----------------------------------------------------------------------

const ZONE = 'Africa/Maputo';

function maputoParts(date: Date): Record<string, string> {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  })
    .formatToParts(date)
    .reduce<Record<string, string>>((acc, part) => {
      acc[part.type] = part.value;
      return acc;
    }, {});
}

/** Hoje em Maputo, no formato yyyy-MM-dd. */
export function todayMaputo(): string {
  const p = maputoParts(new Date());
  return `${p.year}-${p.month}-${p.day}`;
}

export function firstDayOfMonthMaputo(): string {
  return `${todayMaputo().slice(0, 8)}01`;
}

/** Data e hora de um instante em Maputo, no formato yyyy-MM-ddTHH:mm (para inputs datetime-local). */
export function toMaputoLocal(iso?: string | null): string {
  const p = maputoParts(iso ? new Date(iso) : new Date());
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

export function formatDateTime(iso?: string | null): string {
  if (!iso) return '—';
  const p = maputoParts(new Date(iso));
  return `${p.day}/${p.month}/${p.year} ${p.hour}:${p.minute}`;
}

/** yyyy-MM-dd -> dd/MM/yyyy, sem conversao de fuso. */
export function formatDate(value?: string | null): string {
  if (!value) return '—';
  const [year, month, day] = value.slice(0, 10).split('-');
  return `${day}/${month}/${year}`;
}

export function formatMzn(value?: number | string | null): string {
  return formatMoney(value, 'MZN');
}
