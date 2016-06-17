/* @flow */

function pamEncode(str: string): string {
  return encodeURIComponent(str).replace(/[!'()*~]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase());
}

function objectToList(o: Object): Array<mixed> {
  let l = [];
  Object.keys(o).forEach((key) => l.push(key));
  return l;
}

function objectToListSorted(o: Object): Array<mixed> {
  return objectToList(o).sort();
}

module.exports = {
  signPamFromParams(params: Object): string {
    let l = objectToListSorted(params);
    return l.map((paramKey) => paramKey + '=' + pamEncode(params[paramKey])).join('&');
  },
  endsWith(searchString: string, suffix: string): boolean {
    return searchString.indexOf(suffix, this.length - suffix.length) !== -1;
  }
};
