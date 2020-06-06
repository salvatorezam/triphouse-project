var express = require('express');
var router = express.Router();
var createError = require('http-errors');

//const crypto = require('crypto');
const { config } = require('../db/config');
const { makeDb, withTransaction } = require('../db/dbmiddleware');

/* GET finestraListaPrenotazioniEffettuate */
router.get('/finestraListaPrenotazioniEffettuate', getListaPrenotazioniEffettuate);

async function getListaPrenotazioniEffettuate(req, res, next) {

  const db = await makeDb(config);
  let prenConcluse = {};
  let prenNonConcluse = {};
  try {
      await withTransaction(db, async() => {
          
          let sql1 = "SELECT * FROM Prenotazione WHERE stato_prenotazione = 'conclusa';";
          prenConcluse = await db.query(sql1)
              .catch(err => {
                  throw err;
              });

          let sql2 = "SELECT * FROM Prenotazione WHERE stato_prenotazione <> 'conclusa';";
          prenNonConcluse = await db.query(sql2)
              .catch(err => {
                  throw err;
              });
          
          console.log('prenCONCLUSE');
          console.log(prenConcluse.length);
          console.log(prenConcluse);
          console.log('prenNON');
          console.log(prenNonConcluse.length);
          console.log(prenNonConcluse);
          
                  
          //let id_utente = prenConcluse[0].nome_cognome;
          res.render('finestraListaPrenotazioniEffettuate', {dataC: prenConcluse, dataNC: prenNonConcluse});
      });
  } catch (err) {
      console.log(err);
      next(createError(500));
  }
}
  
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