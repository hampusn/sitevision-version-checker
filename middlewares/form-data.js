// Add form data to request
const URL = require('url').URL;

function ensureProtocol (url) {
  if (url.substr(0, 4) !== 'http') {
    url = 'http://' + url;
  }
  return url;
}

module.exports = () => {
  return function formDataMiddleware (req, res, next) {
    let url   = (req.query.url || '').toLowerCase();
    let valid = false;
    let urlObj;

    if (url) {
      // If no protocol exist, default to http.
      url = ensureProtocol(url);

      try {
        urlObj = new URL(url);
      } catch (e) {}

      if (urlObj) {
        url   = urlObj.origin;
        valid = true;

        if (urlObj.search || urlObj.hash || urlObj.pathname.length > 1) {
          return res.redirect('/?url=' + urlObj.origin);
        }
      }
    }

    req.context = req.context || {};
    req.context.url = url;
    req.context.valid = valid;

    next();
  };
};
