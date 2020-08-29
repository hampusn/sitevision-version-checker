const got = require('got');
const cache = new Map(); // in-memory cache
const fetcher = got.extend({
  timeout: {
    lookup: (process.env.LOOKUP_TIMEOUT || 1000),
    request: (process.env.REQUEST_TIMEOUT || 5000)
  },
  retry: 1,
  maxRedirects: (process.env.REQUEST_MAX_REDIRECTS || 4),
  https: {
    rejectUnauthorized: false
  },
  cache
});

class HTTPFetcher {
  constructor (url) {
    this._url = url;
  }

  execute () {
    return fetcher(this._url);
  }
}

module.exports = HTTPFetcher;
