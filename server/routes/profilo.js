var express = require('express');
var router = express.Router();

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

  module.exports = router;