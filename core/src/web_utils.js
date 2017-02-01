

module.exports = {
  getCookie: function (key) {
    if (document.cookie.indexOf(key) === -1) return null;
    return ((document.cookie || '').match(
        RegExp(key + '=([^;]+)')
      ) || [])[1] || null;
  },
  setCookie: function (key, value, date) {
    var cookieContents = key + '=' + value;
    cookieContents += '; expires=' + date.toUTCString();
    cookieContents += '; path=/';

    if (location && location.protocol && location.protocol === 'https:') {
      cookieContents += '; Secure';
    }

    document.cookie = cookieContents;
  }

};
