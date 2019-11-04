// Add view data to request
const URL = require('url').URL;

function removeTrailingSlashes (str) {
  return str.replace(/\/+$/, '');
}

function removeLeadingSlashes (str) {
  return str.replace(/^\/+/, '');
}

function githubUrl (url, path) {
  let urlObj = new URL(url);

  urlObj.search   = '';
  urlObj.hash     = '';
  urlObj.pathname = removeTrailingSlashes(urlObj.pathname) + '/' + removeLeadingSlashes(path);

  return urlObj.toString();
}

module.exports = () => {
  const project = require('../package');

  return function contextMiddleware (req, res, next) {
    req.context = req.context || {};

    req.context.hostname = req.hostname;
    req.context.protocol = req.headers['x-forwarded-proto'] || req.protocol;
    req.context.origin = `${req.context.protocol}://${req.context.hostname}/`;

    req.context.app = {
      "version": project.version,
      "author": project.author,
      "license": project.license,
      "name": project.name,
      "siteName": "SiteVision version checker",
      "githubUrl": project.homepage,
      "licenseSPDX": project.license,
      "licenseUrl": githubUrl(project.homepage, 'blob/master/LICENSE')
    };

    next();
  };
};
