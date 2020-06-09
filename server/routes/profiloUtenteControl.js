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
  let results = {};
  let prenConcluse = {};
  let prenNonConcluse = {};
  try {
      await withTransaction(db, async() => {

          let sql0 = "SELECT * FROM USERS_SESSIONS WHERE session_id = ?;";
          results = await db.query(sql0, [req.session.id])
              .catch(err => {
                  throw err;
              });

          if (results.affectedRows == 0) {
              console.log('Sessione Utente non trovata!');
              next(createError(404, 'Sessione Utente non trovata'));
          } else {
              console.log(results[0]);
              var idUtente = JSON.parse(results[0].data);
              idUtente = idUtente.user.id_utente;
              console.log(idUtente);
          }
          
          let sql1 = "SELECT p.ID_PREN AS ID_PREN, p.data_inizio AS data_inizio, a.titolo AS titolo, a.citta AS citta, p.stato_prenotazione AS stato_pren \
                      FROM Prenotazione p, Alloggio a \
                      WHERE p.alloggio = a.ID_ALL AND p.stato_prenotazione <> 'conclusa' AND p.utente = ?;";
          prenConcluse = await db.query(sql1, idUtente)
              .catch(err => {
                  throw err;
              });
          
          for (el of prenConcluse) {
            listaIdPrenConcluse.push(el.ID_PREN);
          }

          let sql2 = "SELECT p.ID_PREN AS ID_PREN, p.data_inizio AS data_inizio, a.titolo AS titolo, a.citta AS citta, p.stato_prenotazione AS stato_pren \
                      FROM Prenotazione p, Alloggio a \
                      WHERE p.alloggio = a.ID_ALL AND p.stato_prenotazione = 'conclusa' AND p.utente = ?;";
          prenNonConcluse = await db.query(sql2, idUtente)
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
  let recData = {};
  let stato_pren = "";
  let stato_rec = "";
  let stato_pag = "";

  try {
      await withTransaction(db, async() => {
          
          //dati prenotazione che mi servono
          let sql = "SELECT p.data_inizio AS data_inizio, p.data_fine AS data_fine, \
                      a.titolo AS titolo, a.indirizzo AS indirizzo, a.n_civico AS n_civico, \
                      a.citta AS citta, ur.telefono AS telefono_prp, a.tipo_all AS tipo_all, \
                      a.nome_proprietario AS nome_proprietario, p.prezzo_totale AS prezzo_totale, ur.email AS email_prp, \
                      p.stato_prenotazione AS stato_prenotazione \
                      FROM Prenotazione p, Alloggio a, UtenteRegistrato ur \
                      WHERE p.alloggio = a.ID_ALL AND a.proprietario = ur.ID_UR AND a.titolo = 'Casa Roma';";
          prenData = await db.query(sql)
              .catch(err => {
                  throw err;
              });
          
          //check per verificare la possibilità di annullare la prenotazione o pagare
          if (prenData[0].stato_prenotazione == 'conclusa') {

            // METTERCI ANCHE LA DATA DI SCADENZA 
            //disabilita tasto annullamento
            stato_pren = "disabled";

            //disabilita tasto pagamento
            stato_pag = "disabled";
          }

          //check per verificare la possibilità di pagamento
          if (prenData[0].stato_prenotazione == 'richiesta' || prenData[0].stato_prenotazione == 'pagata') {

            stato_pag = "disabled";
          }
          
          //dati recensione                     METTERE TUTTE LE SQL ASSIEME
          let sql_rec = "SELECT p.ID_PREN \
                          FROM Prenotazione p, Alloggio a, RecensisciAlloggio ra \
                          WHERE p.alloggio = a.ID_ALL AND ra.alloggio = a.ID_ALL AND a.titolo = 'Casa Roma';";
          recData = await db.query(sql_rec)
              .catch(err => {
                  throw err;
              });
          
          //check per verificare la possibilità di recensire (in base a recensioni già fatte o conclusione vacanza)
          if (recData.length != 0 || prenData[0].stato_prenotazione != 'conclusa') {

            stato_rec = "disabled";
          }
          
          //DA CANCELLARE
          console.log('DATI PRENOTAZIONE: ');
          console.log(prenData);

          console.log('DATI RECENSIONE: ');
          console.log(stato_rec);
          
          res.render('finestraPrenotazioneEffettuata', {data : {data_pren : prenData, data_rec : stato_rec, data_ann : stato_pren, data_pag : stato_pag}});
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
            '2d8cdeb2-a755-11ea-b30a-a066100a22be',
            req.body.valutazione
          ];
          recensione = await db.query(sql, values)
              .catch(err => {
                  throw err;
              }); 
          
          console.log(req.body);
          //DA CANCELLARE
          console.log('DATI RECENSIONE: ');
          console.log(values);
          
          res.redirect('/profiloUtenteControl/finestraPrenotazioneEffettuata');
      });
  } catch (err) {
      console.log(err);
      next(createError(500));
  }
}

/* Annulla Prenotazione */
router.get('/annullaPrenotazione', annullaPrenotazione);

async function annullaPrenotazione(req, res, next) {

  const db = await makeDb(config);

  try {
    await withTransaction(db, async() => {

      //MODIFICARE SQL ASSOLUTAMENTE
      let sql = "UPDATE Prenotazione \
                  SET stato_prenotazione = 'conclusa' \
                  WHERE ID_PREN = '485ae14d-a756-11ea-b30a-a066100a22be';";
      annullamento = await db.query(sql)
          .catch(err => {
              throw err;
          });

      console.log('Prenotazione annullata');
      res.redirect('/profiloUtenteControl/finestraPrenotazioneEffettuata');
    });
  } catch (err) {
      console.log(err);
      next(createError(500));
  }
}

module.exports = router;