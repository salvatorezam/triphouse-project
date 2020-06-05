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
  let results = {};
  try {
      await withTransaction(db, async() => {
          
          let sql = "SELECT * FROM Prenotazione;";
          results = await db.query(sql)
              .catch(err => {
                  throw err;
              });
      
          //let pwd = req.body.my_pass; 
          console.log(results);
                  
          //let id_utente = results[0].nome_cognome;
          console.log('Dati utente:');
          console.log(results[0]);
          res.render('finestraListaPrenotazioniEffettuate', {data: results[0]});
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