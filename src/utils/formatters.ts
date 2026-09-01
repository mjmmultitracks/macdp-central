export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  if (!year || !month || !day) {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('pt-BR');
  }
  return `${day}/${month}/${year}`;
}

export function formatEventDateRange(startDate: string, endDate?: string): string {
  if (!startDate) return '';
  if (!endDate || endDate === startDate) {
    return formatDate(startDate);
  }
  const [sYear, sMonth, sDay] = startDate.split('-');
  const [eYear, eMonth, eDay] = endDate.split('-');
  if (sYear && sMonth && sDay && eYear && eMonth && eDay) {
    if (sYear === eYear && sMonth === eMonth) {
      return `${sDay} a ${eDay}/${sMonth}/${sYear}`;
    }
    if (sYear === eYear) {
      return `${sDay}/${sMonth} a ${eDay}/${eMonth}/${sYear}`;
    }
    return `${sDay}/${sMonth}/${sYear} a ${eDay}/${eMonth}/${eYear}`;
  }
  return `${formatDate(startDate)} a ${formatDate(endDate)}`;
}

export function formatDateTime(isoString: string): string {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

export function calculateAge(birthDateString: string): number | null {
  if (!birthDateString) return null;
  // Handle YYYY-MM-DD or DD/MM/YYYY
  let birth: Date;
  if (birthDateString.includes('/')) {
    const [day, month, year] = birthDateString.split('/');
    birth = new Date(Number(year), Number(month) - 1, Number(day));
  } else {
    birth = new Date(birthDateString);
  }

  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age >= 0 && age <= 130 ? age : null;
}
