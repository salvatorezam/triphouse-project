var express = require('express'); 
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  //var elnull = null;
  //req.app.locals.users = [elnull];
  //res.send(req.session.user.id_utente);
  res.render('index');
});

/* GET registrazione. */
router.get('/registrazione', function(req, res, next) {
  res.render('registrazione');
});

/* GET autenticazione. */
router.get('/autenticazione', function(req, res, next) {
  res.render('autenticazione');
});

/* GET diventa host. */
router.get('/diventahost', function(req, res, next) {
  res.render('finestraDiventaHost');
});

/* GET alloggio page. */
router.get('/alloggio', function(req, res, next) {
  res.render('alloggio');
});

module.exports = router;