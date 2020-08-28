const express   = require('express');
const HTTPFetcher = require('./services/HTTPFetcher');
const VersionExtractor = require('./services/VersionExtractor');
const ResultCache = require('./services/ResultCache');

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
app.use(require('./middlewares/form-data')());
app.use(express.static(__dirname + '/public'));

// Start server
app.listen(app.get('port'), () => {
  console.log("Server listening on port: %s", app.get('port'));
});


app.get('/', async (req, res, next) => {
  let url   = req.context.url;
  let valid = req.context.valid;

  if (url && !valid) {
    let error = new Error();
    error.status = 400;
    error.message = 'Ogiltig webbadress';
    return next(error);
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
    
      req.context.version = version;
      req.context.exactVersion = exactVersion;
    } catch (e) {
      e.status = e.status || 400;
      return next(e);
    }
  }

  return res.render('pages/index', req.context);
});


// Error handlers

app.get('*', (req, res, next) => {
  let error = new Error();
  error.status = 404;
  error.message = 'The resource you were looking for could not be found.';
  next(error);
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  res.status(error.status || 500);

  if (req.xhr) {
    res.send({
      "status": error.status,
      "error": error.message
    });
  } else {
    req.context.error = error;
    res.render('pages/error', req.context);
  }
});
