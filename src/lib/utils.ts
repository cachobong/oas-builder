export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
