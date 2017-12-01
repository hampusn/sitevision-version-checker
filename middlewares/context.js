// Add view data to request
module.exports = () => {
  const project = require('../package');

  return function contextMiddleware (req, res, next) {
    req.context = req.context || {};

    req.context.app = {
      "version": project.version,
      "author": project.author,
      "license": project.license,
      "name": project.name,
      "githubUrl": project.homepage
    };

    next();
  };
};
