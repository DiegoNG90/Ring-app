export function capitalize(slug: string) {
  const parsedSlug = slug.replace('-', ' ');
  const firstLetterCapitalized = parsedSlug.charAt(0).toUpperCase();
  const restOfString = parsedSlug.slice(1);

  return firstLetterCapitalized + restOfString;
}

export function replaceBlankSpaceForHypen(sentence: string) {
  return sentence.replaceAll(' ', '-').toLowerCase();
}

export function slugifyTrainingTitle(title: string): string {
  return title
    .normalize('NFC')
    .trim()
    .toLowerCase()
    .replace(/[\s:]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function getTrainingHref(trainingId: number, trainingTitle: string): string {
  const slug = slugifyTrainingTitle(trainingTitle);
  return `/training/${slug}-${trainingId}`;
}

export function normalizeUrlSlug(slug: string) {
  const arrStr = slug.split('-');
  arrStr.pop();
  return arrStr.join(' ');
}
