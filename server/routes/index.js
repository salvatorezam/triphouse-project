var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

/* GET ricerca. */
router.get('/ricerca', function(req, res, next) {
  res.render('ricerca');
});

/* GET registrazione. */
router.get('/registrazione', function(req, res, next) {
  res.render('registrazione');
});

/* GET aggiungiAlloggio */
router.get('/aggiungiAlloggio', function(req, res, next) {
  res.render('aggiungiAlloggioDir/aggiungiAlloggio');
});

/* GET visualizzaAlloggio */
router.get('/visualizzaAlloggio', function(req, res, next) {
  res.render('visualizzaAlloggio');
});

/* GET alloggio page. */
router.get('/alloggio', function(req, res, next) {
  res.render('alloggio');
});

module.exports = router;
