/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  const newAr = arr.slice();

  newAr.sort((a, b) => {
    const result = a.localeCompare(b, ['ru-RU', 'en-US'], {caseFirst: 'upper'});

    if (param === 'asc')
      return result;
    else if (param === 'desc')
      return -result;
  });

  return newAr;
}
