const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});

/**
 * Fixed time zone keeps SSR and client hydration output identical, avoiding
 * hydration mismatches caused by the server/browser time zone difference.
 */
export function formatDateTime(isoDate: string): string {
  return dateTimeFormatter.format(new Date(isoDate));
}
