export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

/** "P." for "Georgios Papadakis"; null for a single-word name. */
export function surnameInitial(name: string): string | null {
  const parts = name.trim().split(/\s+/);
  return parts.length > 1 ? `${parts[parts.length - 1]!.charAt(0)}.` : null;
}

/** "Georgios P.": first name plus surname initial. */
export function shortName(name: string): string {
  const initial = surnameInitial(name);
  return initial ? `${firstName(name)} ${initial}` : firstName(name);
}
