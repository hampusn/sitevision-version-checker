const express   = require('express');
const request   = require('request');
const cheerio   = require('cheerio');
const math      = require('./helpers/math');
const cache     = require('./helpers/cache');

// Create server
const app = express();

// Set app variables
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.set('port', (process.env.PORT || 5000));

// Setup middlewares
app.use(require('./middlewares/context')());
app.use(require('./middlewares/form-data')());
app.use(express.static(__dirname + '/public'));

// Start server
const http = app.listen(app.get('port'), () => {
  console.log("Server listening on port: %s", app.get('port'));
});


app.get('/', (req, res, next) => {
  let url   = req.context.url;
  let valid = req.context.valid;

  if (url && !valid) {
    let error = new Error();
    error.status = 400;
    error.message = 'Ogiltig webbadress';
    return next(error);
  }

  if (valid) {
    cache(url, (url, resolve, reject) => {
      request(url, {}, (error, response, body) => {
        if (error) {
          reject(error);
          return;
        }

        const $ = cheerio.load(body);

        let versions = $('head').find('link[type="text/css"][href^="/sitevision/"]').map((i, el) => {
          let matches = $(el).attr('href').match(/\/sitevision\/(.*?)\//);

          if (matches && matches.length === 2) {
            return matches[1];
          }

          return "";
        }).get();

        let topVersion = math.mode(versions);
        
        resolve(topVersion);
      });
    }).then((version) => {
      req.context.version = version;
      res.render('pages/index', req.context);
    }).catch((error) => {
      error.status = error.status || 400;
      next(error);
    });
  } else {
    res.render('pages/index', req.context);
  }
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
