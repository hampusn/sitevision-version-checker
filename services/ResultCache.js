const NodeCache = require('node-cache');
const stdTTL = process.env.CACHE_TTL || 10800;
const cache = new NodeCache({stdTTL, "checkperiod": 0});

class ResultCache {
  constructor (url) {
    this._url = url;
  }

  key () {
    return `${this._url}`.trim();
  }

  get () {
    return cache.get(this.key());
  }

  set (data) {
    cache.set(this.key(), data);
  }
}

module.exports = ResultCache;
