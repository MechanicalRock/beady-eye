export const flatten = (arr: Array<any>) => {
  if (arr.length == 0) {
    return [];
  }

  return arr.reduce((item, toFlatten) => {
    const rest = Array.isArray(toFlatten) ? this.flatten(toFlatten) : toFlatten;
    const arr = item instanceof Array ? item : [item];
    return arr.concat(rest);
  });
};
