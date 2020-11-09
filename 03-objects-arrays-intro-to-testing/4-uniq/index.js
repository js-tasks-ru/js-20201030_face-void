/**
 * uniq - returns array of uniq values:
 * @param {*[]} arr - the array of primitive values
 * @returns {*[]} - the new array with uniq values
 */
export function uniq(arr) {
  let arReturn = [];

  if (arr !== undefined) {
    arr.map(e => {
      if (!arReturn.includes(e))
        arReturn.push(e);
    });
  }

  return arReturn;
}
