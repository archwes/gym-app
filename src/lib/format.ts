/**
 * Formata telefone brasileiro: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
 */
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/**
 * Formata CREF: 000000-G/UF
 */
export function formatCREF(value: string): string {
  const cleaned = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 9);
  if (cleaned.length === 0) return '';
  // First 6 chars are digits
  const digits = cleaned.slice(0, 6).replace(/[^0-9]/g, '');
  const rest = cleaned.slice(6);
  if (digits.length < 6) return digits;
  if (!rest) return `${digits}-`;
  const letter = rest.slice(0, 1).replace(/[^A-Z]/g, '');
  if (!letter) return `${digits}-`;
  const uf = rest.slice(1, 3).replace(/[^A-Z]/g, '');
  if (!uf) return `${digits}-${letter}/`;
  return `${digits}-${letter}/${uf}`;
}

/**
 * Calcula a força da senha (0-4)
 * 0 = muito fraca, 1 = fraca, 2 = razoável, 3 = forte, 4 = muito forte
 */
export function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  // Cap at 4
  score = Math.min(score, 4);
  const labels = ['Muito fraca', 'Fraca', 'Razoável', 'Forte', 'Muito forte'];
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];
  return { score, label: labels[score], color: colors[score] };
}

/**
 * Formata data de YYYY-MM-DD para DD/MM/YYYY
 */
export function formatDateBR(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}
