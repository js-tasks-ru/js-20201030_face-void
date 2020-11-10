/**
 * invertObj - should swap object keys and values
 * @param {object} obj - the initial object
 * @returns {object | undefined} - returns new object or undefined if nothing did't pass
 */
export function invertObj(obj) {
  if (obj === undefined)
    return undefined;

  const inverterObj = Object.entries(obj).map(([k, v]) => [v, k]);

  return Object.fromEntries(inverterObj);
}
