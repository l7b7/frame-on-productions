/** Presentation only: stored content, links and decimal values remain intact. */
export function displayText(value: string): string {
  return value.replace(/\.+(?=\s|$)/g, '').replace(/[。…]+(?=\s*$)/gm, '');
}
