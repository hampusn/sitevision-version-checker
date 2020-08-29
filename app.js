const express = require('express');
const HTTPFetcher = require('./services/HTTPFetcher');
const VersionExtractor = require('./services/VersionExtractor');
const ResultCache = require('./services/ResultCache');
const boom = require('@hapi/boom');

// Create server
const app = express();

// Misc server config
app.disable('x-powered-by');

// Set app variables
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.set('port', (process.env.PORT || 5000));

// Setup middlewares
app.use(require('./middlewares/context')());
app.use(require('./middlewares/data')());
app.use(require('./middlewares/respond')());
app.use(express.static(__dirname + '/public'));

// Start server
app.listen(app.get('port'), () => {
  console.log("Server listening on port: %s", app.get('port'));
});


app.get('/', async (req, res, next) => {
  let url = req.data.url;
  let valid = req.data.valid;

  if (url && !valid) {
    return next(boom.badRequest('Ogiltig webbadress.'));
  }

  if (url) {
    try {
      const cache = new ResultCache(url);
      let data = cache.get();

      if (!data) {
        const fetcher = new HTTPFetcher(url);
        const result = await fetcher.execute();
      
        const extractor = new VersionExtractor(result.body);
        data = extractor.execute();
    
        cache.set(data);
      }
    
      const { version = '', exactVersion = false } = data || {};
    
      req.data.version = version;
      req.data.exactVersion = exactVersion;
    } catch (e) {
      boom.boomify(e, { statusCode: 400 });
      return next(e);
    }
  }

  return res.respond('pages/index', req.data, req.context);
});


// Error handlers

app.get('*', (req, res, next) => {
  next(boom.notFound('Innehållet du letade efter kunde inte hittas.'));
});

app.use((error, req, res, next) => {
  if (!boom.isBoom(error)) {
    boom.boomify(error);
  }
  
  if (res.headersSent) {
    return next(error);
  }

  
  res.status(error.output.statusCode);

  req.data.error = error.output.payload;
  res.respond('pages/error', req.data, req.context);
});
