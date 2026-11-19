/** Rows per page offered by every paged list; the first is the default. */
export const PAGE_SIZES = [10, 25, 50];

/** The page actually shown: a list that shrank never leaves you on an empty page. */
export function shownPage(page, count, size) {
  return Math.min(Math.max(0, page), Math.max(0, Math.ceil(count / size) - 1));
}

/** The rows of that page. */
export function pageOf(list, page, size) {
  const shown = shownPage(page, list.length, size);
  return list.slice(shown * size, (shown + 1) * size);
}
