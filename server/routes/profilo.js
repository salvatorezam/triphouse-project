var express = require('express');
var router = express.Router();
var createError = require('http-errors');

//creo degli array per salvare gli id delle prenotazioni
var listaIdPrenConcluse = [];
var listaIdPrenNonConcluse = [];

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
          
          let sql1 = "SELECT p.ID_PREN AS ID_PREN, p.data_inizio AS data_inizio, a.titolo AS titolo, a.citta AS citta, p.stato_prenotazione AS stato_pren \
                      FROM Prenotazione p, Alloggio a \
                      WHERE p.alloggio = a.ID_ALL AND p.stato_prenotazione = 'conclusa';";
          prenConcluse = await db.query(sql1)
              .catch(err => {
                  throw err;
              });
          
          for (el of prenConcluse) {
            listaIdPrenConcluse.push(el.ID_PREN);
          }

          let sql2 = "SELECT p.ID_PREN AS ID_PREN, p.data_inizio AS data_inizio, a.titolo AS titolo, a.citta AS citta, p.stato_prenotazione AS stato_pren \
                      FROM Prenotazione p, Alloggio a \
                      WHERE p.alloggio = a.ID_ALL AND p.stato_prenotazione <> 'conclusa';";
          prenNonConcluse = await db.query(sql2)
              .catch(err => {
                  throw err;
              });
          
          for (el of prenNonConcluse) {
            listaIdPrenNonConcluse.push(el.ID_PREN);
          }
          
          //DA CANCELLARE
          console.log('prenCONCLUSE');
          console.log(listaIdPrenConcluse);
          console.log(prenConcluse.length);
          console.log(prenConcluse);
          console.log('prenNON');
          console.log(listaIdPrenNonConcluse);
          console.log(prenNonConcluse.length);
          console.log('ecco');
          console.log({dataNC: prenNonConcluse});
          
                  
          //let id_utente = prenConcluse[0].nome_cognome;
          res.render('finestraListaPrenotazioniEffettuate', {data : {dataC: prenConcluse, dataNC: prenNonConcluse}});
      });
  } catch (err) {
      console.log(err);
      next(createError(500));
  }
}
  
/* GET finestraPrenotazioneEffettuata */
router.get('/finestraPrenotazioneEffettuata', getPrenotazioneEffettuata);

async function getPrenotazioneEffettuata(req, res, next) {

  const db = await makeDb(config);
  let prenData = {};
  try {
      await withTransaction(db, async() => {
          
          let sql = "SELECT p.data_inizio AS data_inizio, p.data_fine AS data_fine, \
                      a.titolo AS titolo, a.indirizzo AS indirizzo, a.n_civico AS n_civico, \
                      a.citta AS citta, ur.telefono AS telefono_prp, a.tipo_all AS tipo_all, \
                      a.nome_proprietario AS nome_proprietario, p.prezzo_totale AS prezzo_totale, ur.email AS email_prp \
                      FROM Prenotazione p, Alloggio a, UtenteRegistrato ur \
                      WHERE p.alloggio = a.ID_ALL AND a.proprietario = ur.ID_UR AND a.titolo = 'Casa Roma';";
          prenData = await db.query(sql)
              .catch(err => {
                  throw err;
              });
          
          //DA CANCELLARE
          console.log('DATI PRENOTAZIONE: ');
          console.log({data : prenData});
          
          res.render('finestraPrenotazioneEffettuata', {data : prenData});
      });
  } catch (err) {
      console.log(err);
      next(createError(500));
  }
}
  


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

/* GET finestraComDatiOspiti */
router.get('/finestraComDatiOspiti', function(req, res, next) {
  res.render('finestraComDatiOspiti');
});

/* Recensisci Alloggio */
router.post('/recensisciAlloggio', recensisciAlloggio);

async function recensisciAlloggio(req, res, next) {

  const db = await makeDb(config);
  let recensione = {};
  var today = new Date();

  try {
      await withTransaction(db, async() => {
          
          let sql = "INSERT INTO RecensisciAlloggio VALUES (UUID(),?,?,?,?,?);";
          let values = [
            req.body.testoRec,
            today,
            'scrittore_rec',
            'alloggio_rec',
            req.body.valutazione
          ];
          recensione = await db.query(sql, values)
              .catch(err => {
                  throw err;
              }); 
          
          console.log(req.body);
          //DA CANCELLARE
          console.log('DATI RECENSIONE: ');
          //console.log(values);
          
          res.status(204).send();
      });
  } catch (err) {
      console.log(err);
      next(createError(500));
  }
}

module.exports = router;