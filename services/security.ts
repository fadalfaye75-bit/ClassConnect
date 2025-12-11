
/**
 * Service de sécurité pour gérer le hachage et la validation.
 */

// Hash SHA-256 du mot de passe administrateur par défaut ('passer25')
export const ADMIN_HASH = "2c40c302d653767f707f15951745772648581604085465972827258455643444";

/**
 * Hache une chaîne de caractères en SHA-256.
 * @param text Le texte à hacher.
 * @returns Le hash en format hexadécimal.
 */
export const hashString = async (text: string): Promise<string> => {
  const msgBuffer = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Sanitisation pour les exports CSV afin d'éviter les injections de formules (CSV Injection).
 * Si une cellule commence par =, +, - ou @, on ajoute une quote pour forcer le format texte.
 */
export const sanitizeForCSV = (str: string | undefined | null): string => {
  if (!str) return '';
  const forbidden = ['=', '+', '-', '@'];
  const stringified = String(str);
  if (forbidden.includes(stringified.charAt(0))) {
    return "'" + stringified;
  }
  return stringified;
};

/**
 * Validation stricte d'email.
 */
export const isValidEmail = (email: string): boolean => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email);
};
