var express = require('express');
var router = express.Router();
var createError = require('http-errors');

//creo degli array per salvare gli id delle prenotazioni
var listaIdPrenConcluse = [];
var listaIdPrenNonConcluse = [];

//const crypto = require('crypto');
const { config } = require('../db/config');
const { makeDb, withTransaction } = require('../db/dbmiddleware');

/* GET finestraListaPrenotazioniRicevute */
router.get('/finestraListaPrenotazioniRicevute', function(req, res, next) {
    res.render('finestraListaPrenotazioniRicevute');
  });
  
  /* GET finestraPrenotazioneRicevuta */
  router.get('/finestraPrenotazioneRicevuta', function(req, res, next) {
    res.render('finestraPrenotazioneRicevuta');
  });
  
  /* GET finestraComDatiOspiti */
  router.get('/finestraComDatiOspiti', function(req, res, next) {
    res.render('finestraComDatiOspiti');
  });

  module.exports = router;