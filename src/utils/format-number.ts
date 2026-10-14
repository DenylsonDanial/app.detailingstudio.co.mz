import numeral from 'numeral';

// ----------------------------------------------------------------------

type InputValue = string | number | null;

export function fNumber(number: InputValue) {
  return numeral(number).format();
}

export function fCurrency(number: InputValue) {
  if (number == null) {
    return '';
  }

  const num = typeof number === 'string' ? parseFloat(number) : number;

  if (Number.isNaN(num)) {
    return '';
  }

  // Format the number manually
  const [integerPart, decimalPart] = num.toFixed(2).split('.');

  const withThousandsSeparator = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return `${withThousandsSeparator},${decimalPart}`;
}

export function fCurrencyDashboard(number: InputValue, accountType: string) {
  const formated = fCurrency(number);

  let num: number;

  if (typeof number === 'string') {
    num = parseFloat(number);
  } else {
    num = number || 0;
  }

  if (num > 0 && accountType === 'Passivo') {
    return `(${formated})`;
  }

  if (num < 0 && accountType === 'Passivo') {
    return formated.replace('-', '');
  }

  if (num < 0 && accountType === 'Activo') {
    return `(${formated.replace('-', '')})`;
  }

  return formated;
}

const formatedValue = (number: InputValue) => {
  let num: number;
  if (typeof number === 'string') {
    num = parseFloat(number);
  } else {
    num = number || 0;
  }
  return num;
};

export function fCurrencyDashboardReceitas(number: InputValue) {
  const formated = fCurrency(number);
  if (formatedValue(number) > 0) return `(${formated})`;
  if (formatedValue(number) < 0) return formated.replace('-', '');
  return formated;
}

export function fCurrencyDashboardPerdas(number: InputValue) {
  const formated = fCurrency(number);
  if (formatedValue(number) > 0) return `(${formated})`;
  if (formatedValue(number) < 0) return formated.replace('-', '');
  return formated;
}

export function fCurrencyMZN(number: InputValue) {
  if (number == null) {
    return '';
  }

  const num = typeof number === 'string' ? parseFloat(number) : number;

  if (Number.isNaN(num)) {
    return '';
  }

  const formatter = new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'MZN',
  });

  return formatter.format(num);
}

export function fPercent(number: InputValue) {
  const format = number ? numeral(Number(number) / 100).format('0.0%') : '';

  return result(format, '.0');
}

export function fShortenNumber(number: InputValue) {
  const format = number ? numeral(number).format('0.00a') : '';

  return result(format, '.00');
}

export function fData(number: InputValue) {
  const format = number ? numeral(number).format('0.0 b') : '';

  return result(format, '.0');
}

function result(format: string, key = '.00') {
  const isInteger = format.includes(key);

  return isInteger ? format.replace(key, '') : format;
}
