export function isAllowedDomain(email: string) {
  const domain = process.env.ALLOWED_DOMAIN?.toLowerCase();
  return domain ? email.toLowerCase().endsWith(`@${domain}`) : true;
}
