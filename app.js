const express = require('express');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const dotenv = require('dotenv');
const nunjucks = require('nunjucks');
dotenv.config();

const indexRouter = require('./routes/index');

const app = express();
// Set port and view engine
app.set('port', process.env.PORT || 3000);
app.set('view engine', 'html');
nunjucks.configure('views', {
  express: app,
  watch: true,
});

// Set packages depend on environment level
if (process.env.NODE_ENV === 'production') {
  app.enable('trust proxy');
  app.use(morgan('combined'));
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: false,
    }),
  );
  app.use(hpp());
} else {
  app.use(morgan('dev'));
}
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set router
app.use('/', indexRouter);

//Set Socket
const initSocket = require('./socket');
const http = require('http');
const server = http.createServer(app);
initSocket(server, app);

// Page not found handler
app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} Router doesn't exists`);
  error.status = 404;
  next(error);
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

server.listen(app.get('port'), () => {
  console.log('Server is listening at ', app.get('port'));
});

module.exports = app;