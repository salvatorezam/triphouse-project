var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');



var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var profiloUtenteRouter = require('./routes/profiloUtenteControl');
var profiloHostRouter = require('./routes/profiloHostControl');
var prenotazioneRouter = require('./routes/prenotazione');
var aggiungiAlloggio = require('./routes/aggiungiAlloggio');
var RegAutControl = require('./routes/RegAutControl');
var visualizzaAlloggio = require('./routes/visualizzaAlloggio');

var app = express();

//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
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
app.use('/prenotazione', prenotazioneRouter);
app.use('/aggiungiAlloggio', aggiungiAlloggio);
app.use('/regAutControl', RegAutControl);
app.use('/visualizzaAlloggio', visualizzaAlloggio);

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
