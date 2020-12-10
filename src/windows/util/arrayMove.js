/**
 * @param {Array} arr
 * @param {Number} old_index
 * @param {Number} new_index
 */
const move = (arr, old_index, new_index) => {
  let new_arr = [...arr];
  while (old_index < 0) {
    old_index += arr.length;
  }
  while (new_index < 0) {
    new_index += arr.length;
  }
  if (new_index >= arr.length) {
    let k = new_index - arr.length;
    while (k-- + 1) {
      arr.push(undefined);
    }
  }
  new_arr.splice(new_index, 0, new_arr.splice(old_index, 1)[0]);
  return new_arr;
};

module.exports = move;
