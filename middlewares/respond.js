class Responder {
  constructor (req, res, next) {
    this.req = req;
    this.res = res;
    this.next = next;
  }

  isJson () {
    return this.req.is('json') || this.req.query.type === 'json' || this.req.xhr || this.req.accepts(['html', 'json']) === 'json';
  }

  respond (view = '', data = {}, context = {}) {
    if (this.isJson()) {
      this.res.json(data);
    }  else {
      // Default to HTML with view rendering.
      this.res.render(view, { ...context, ...data });
    }
  }
}

module.exports = () => {
  return function respondMiddleware (req, res, next) {
    const r = new Responder(req, res, next);
    res.respond = (...args) => r.respond(...args);
    next();
  };
};
