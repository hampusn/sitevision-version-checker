function mode (arr) {
  return arr.reduce(
    (a, b, i, arr2) =>
      (arr2.filter(v=>v===a).length>=arr2.filter(v=>v===b).length?a:b),
    null);
}

module.exports = {
  "mode": mode
};
