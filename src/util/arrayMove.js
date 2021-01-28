/**
 * @param {Array} previousArray
 * @param {Number} oldIndex
 * @param {Number} newIndex
 * @returns {Array}
 */
const arrayMove = (previousArray, oldIndex, newIndex) => {
  let newArray = [...previousArray];
  while (oldIndex < 0) {
    oldIndex += previousArray.length;
  }
  while (newIndex < 0) {
    newIndex += previousArray.length;
  }
  if (newIndex >= previousArray.length) {
    let k = newIndex - previousArray.length;
    while (k-- + 1) {
      previousArray.push(undefined);
    }
  }
  newArray.splice(newIndex, 0, newArray.splice(oldIndex, 1)[0]);
  return newArray;
};

module.exports = arrayMove;
