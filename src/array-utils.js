const makeArray = obj => {
  if (Array.isArray(obj)) {
    return obj;
  }

  return Array.prototype.slice.call(obj);
};

const arrayDiff = (arrayA, arrayB) => {
  return arrayA.filter(x => !arrayB.includes(x));
};

const arrayDeleteElement = (array, element) => {
  return array.filter(item => item !== element);
};

export { makeArray, arrayDiff, arrayDeleteElement };