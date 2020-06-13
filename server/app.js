var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var session = require('express-session');
//var MySQLStore = require('express-mysql-session')(session);
//const { options } = require('./db/options');

//var sessionStore = new MySQLStore(options);

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var profiloUtenteRouter = require('./routes/profiloUtenteControl');
var profiloHostRouter = require('./routes/profiloHostControl');
var prenotazioneRouter = require('./routes/prenotazioneControl');
var aggiungiAlloggio = require('./routes/aggiungiAlloggio');
var RegAutControl = require('./routes/RegAutControl');
var visualizzaAlloggio = require('./routes/visualizzaAlloggio');
var ricercaControl = require('./routes/ricercaControl');
const { resolveTxt } = require('dns');

var app = express();

app.use(session({
  secret: 'token segreto',
  resave: false,
  saveUninitialized: true,
  unset: 'destroy',
  //store: sessionStore,
  name: 'nome cookie sessione'
}));

app.locals.users = new Map();

app.use(function(req, res, next) {
  res.locals.user = req.session.user;
  res.locals.date = req.session.date;
  res.locals.alloggio = req.session.alloggio;
  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/profiloUtenteControl', profiloUtenteRouter);
app.use('/profiloHostControl', profiloHostRouter);
app.use('/prenotazioneControl', prenotazioneRouter);
app.use('/aggiungiAlloggio', aggiungiAlloggio);
app.use('/regAutControl', RegAutControl);
app.use('/visualizzaAlloggio', visualizzaAlloggio);
app.use('/ricercaControl', ricercaControl);

app.use(bodyParser.json());

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;