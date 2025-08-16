const PROFANITY = new Set([
  "shit","fuck","bitch","bastard","asshole","dick","cunt" // minimal demo list; replace with a better lib in prod
]);

export function maskPII(text: string) {
  // Mask emails
  let out = text.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/ig, "***@***");
  // Mask phone-like numbers (10+ digits)
  out = out.replace(/\b\d{10,}\b/g, "**********");
  return out;
}

export function containsProfanity(text: string) {
  const lower = text.toLowerCase();
  for (const bad of PROFANITY) {
    if (lower.includes(bad)) return true;
  }
  return false;
}

export function sanitizeJourney(text: string) {
  const masked = maskPII(text);
  return masked;
}
