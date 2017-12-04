const NodeCache = require('node-cache');
const cacheTtl  = process.env.CACHE_TTL || 10800;
const cache     = new NodeCache({"stdTTL": cacheTtl, "checkperiod": 0});

module.exports = (key, callback) => {
  let p = new Promise((resolve, reject) => {
    let value = cache.get(key);

    if (value !== undefined) {
      resolve(value);
    } else {
      callback(key, resolve, reject);
    }
  });

  p.then((value) => {
    let notCached = cache.get(key) === undefined;
    if (notCached) {
      cache.set(key, value);
    }
    return value;
  }, (err) => {
    return err;
  });

  return p;
};
