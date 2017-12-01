const NodeCache = require('node-cache');
const cacheTtl  = process.env.CACHE_TTL || 10800;
const cache     = new NodeCache({"stdTTL": cacheTtl, "checkperiod": 0});

module.exports = (url, callback) => {
  let p = new Promise((resolve, reject) => {
    let version = cache.get(url);

    if (version !== undefined) {
      resolve(version);
    } else {
      callback(url, resolve, reject);
    }
  });

  p.then((version) => {
    let notCached = cache.get(url) === undefined;
    if (notCached) {
      cache.set(url, version);
    }
    return version;
  }, (err) => {
    return err;
  });

  return p;
};
