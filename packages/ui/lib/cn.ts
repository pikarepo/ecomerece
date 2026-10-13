export function cn(...classes: Array<string | false | null | undefined | 0 | 0n>): string {
  return classes.filter(Boolean).join(' ');
}
