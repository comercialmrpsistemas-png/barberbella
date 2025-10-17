import { format } from 'date-fns';

export const formatPhone = (value: string) => {
  if (!value) return value;
  const phoneNumber = value.replace(/\D/g, '').slice(0, 11);
  const len = phoneNumber.length;

  if (len <= 2) return `(${phoneNumber}`;
  if (len <= 6) return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2)}`;
  if (len <= 10) return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 6)}-${phoneNumber.slice(6)}`;
  
  return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 7)}-${phoneNumber.slice(7, 11)}`;
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatBirthDate = (value: string): string => {
  if (!value) return value;
  const numbers = value.replace(/\D/g, '').slice(0, 8);
  const len = numbers.length;

  if (len <= 2) return numbers;
  if (len <= 4) return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
  return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4)}`;
};

export const formatCpf = (value: string): string => {
  if (!value) return '';
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

export const toYYYYMMDD = (dateStr: string): string => {
  if (!dateStr || dateStr.length !== 10) return '';
  const [day, month, year] = dateStr.split('/');
  if (day && month && year && year.length === 4) {
    const d = parseInt(day, 10);
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);
    if (d > 0 && d <= 31 && m > 0 && m <= 12 && y > 1900 && y < 2100) {
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  }
  return '';
};

export const toDDMMYYYY = (dateStr: string | undefined): string => {
  if (!dateStr || (dateStr.length !== 10 && !dateStr.includes('T'))) return '';
  try {
    // Handles both 'yyyy-MM-dd' and full ISO strings
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    // Adjust for timezone issues by creating date from UTC parts
    const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    return format(utcDate, 'dd/MM/yyyy');
  } catch (e) {
    return '';
  }
};
