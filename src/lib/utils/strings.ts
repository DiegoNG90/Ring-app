export function capitalize(slug: string) {
  const parsedSlug = slug.replace('-', ' ');
  const firstLetterCapitalized = parsedSlug.charAt(0).toUpperCase();
  const restOfString = parsedSlug.slice(1);

  return firstLetterCapitalized + restOfString;
}

export function replaceBlankSpaceForHypen(sentence: string) {
  return sentence.replaceAll(' ', '-').toLowerCase();
}

export function normalizeUrlSlug(slug: string) {
  const arrStr = slug.split('-');
  arrStr.pop();
  return arrStr.join(' ');
}
