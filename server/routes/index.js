var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET prova. */
router.get('/FLPE', function(req, res, next) {
  res.render('finestraListaPrenotazioniEffettuate.ejs', { title: 'Express' });
});

module.exports = router;
