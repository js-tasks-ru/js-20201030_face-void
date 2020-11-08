/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (size === undefined)
    return string;

  let returnString = '',
      i = 0;

  [...string].reduce((prev, cur) => {
    if (cur === prev) {
      if (i < size) {
        returnString += cur;
        i++;
      }
    } else {
      if (size !== 0) {
        returnString += cur;
        i = 1;
      }
    }

    return cur;
  }, string[0]);

  return returnString;
}
