var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

/* GET ricerca. */
router.get('/Ricerca', function(req, res, next) {
  res.render('Ricerca', { title: 'Express' });
});

/* GET finestraListaPrenotazioniEffettuate */
router.get('/finestraListaPrenotazioniEffettuate', function(req, res, next) {
  res.render('finestraListaPrenotazioniEffettuate');
});

/* GET finestraPrenotazioneEffettuata */
router.get('/finestraPrenotazioneEffettuata', function(req, res, next) {
  res.render('finestraPrenotazioneEffettuata');
});

/* GET modificaDatiPersonali */
router.get('/modificaDatiPersonali', function(req, res, next) {
  res.render('modificaDatiPersonali');
});

/* GET finestraListaPrenotazioniRicevute */
router.get('/finestraListaPrenotazioniRicevute', function(req, res, next) {
  res.render('finestraListaPrenotazioniRicevute');
});

/* GET finestraPrenotazioneRicevuta */
router.get('/finestraPrenotazioneRicevuta', function(req, res, next) {
  res.render('finestraPrenotazioneRicevuta');
});

/* GET aggiungiAlloggio */
router.get('/aggiungiAlloggio', function(req, res, next) {
  res.render('aggiungiAlloggioDir/aggiungiAlloggio');
});

/* GET visualizzaAlloggio */
router.get('/visualizzaAlloggio', function(req, res, next) {
  res.render('visualizzaAlloggio');
});

module.exports = router;
