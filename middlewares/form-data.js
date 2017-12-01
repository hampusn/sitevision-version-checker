// Add form data to request
const validUrl = require('valid-url');

module.exports = () => {
  return function formDataMiddleware (req, res, next) {
    let url   = (req.query.url || '').toLowerCase();
    let valid = validUrl.isWebUri(url);

    if (!valid && url &&  url.substr(0, 4) !== 'http') {
      url = 'http://' + url;
      valid = validUrl.isWebUri(url);
    }

    req.context = req.context || {};
    req.context.url = url;
    req.context.valid = valid;

    next();
  };
};
