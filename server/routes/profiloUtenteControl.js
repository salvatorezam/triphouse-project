var express = require('express');
var router = express.Router();
var createError = require('http-errors');
const { transporter } = require('../mailsender/mailsender-config');
const { inviaMailHost } = require('../mailsender/mailsender-middleware');

//informazioni che mi serve mantenere in memoria
var idUtente = "";
var prenotazioni = {};
var prenData = {};

//const crypto = require('crypto');
const { config } = require('../db/config');
const { makeDb, withTransaction } = require('../db/dbmiddleware');

/* GET finestraListaPrenotazioniEffettuate */
router.get('/finestraListaPrenotazioniEffettuate', getListaPrenotazioniEffettuate);

async function getListaPrenotazioniEffettuate(req, res, next) {

  const db = await makeDb(config);
  let results = {};
  let prenConcluse = [];
  let prenNonConcluse = [];
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
              let datiUtente = JSON.parse(results[0].data);
              idUtente = datiUtente.user.id_utente;
          }
          
          let sql1 = "SELECT p.ID_PREN AS ID_PREN, a.ID_ALL AS ID_ALL, p.data_inizio AS data_inizio, p.data_fine AS data_fine, \
                      a.titolo AS titolo, a.indirizzo AS indirizzo, a.n_civico AS n_civico, \
                      a.citta AS citta,  a.tipo_all AS tipo_all, uh.telefono AS telefono_uh, \
                      a.nome_proprietario AS nome_proprietario, p.prezzo_totale AS prezzo_totale, uh.email AS email_uh, \
                      p.stato_prenotazione AS stato_prenotazione \
                      FROM Prenotazione p, Alloggio a , UtenteRegistrato uh \
                      WHERE p.alloggio = a.ID_ALL AND a.proprietario = uh.ID_UR AND p.utente = ?; \
                      SELECT p.ID_PREN AS ID_PREN, dos.nome AS nome_osp \
                      FROM Prenotazione p, DatiOspiti dos \
                      WHERE dos.prenotazione = p.ID_PREN; \
                      SELECT p.ID_PREN \
                      FROM RecensisciAlloggio ra, Alloggio a, Prenotazione p\
                      WHERE ra.alloggio = a.ID_ALL AND p.alloggio = a.ID_ALL AND ra.scrittore = ?";
          prenotazioni = await db.query(sql1, [idUtente, idUtente])
              .catch(err => {
                  throw err;
              });
          
          //unifico i risultati delle query
          for (elPren of prenotazioni[0]) {

            //ospiti
            elPren.nomi_ospiti = "";
            if (prenotazioni[1].length != 0) {
              for (elDatOsp of prenotazioni[1]) {
                if (elPren.ID_PREN == elDatOsp.ID_PREN) {
                  elPren.nomi_ospiti = elPren.nomi_ospiti + elDatOsp.nome_osp + "-" ;
                }
              }
            }

            //recensioni
            if (prenotazioni[2].length != 0) {
              for (let elRec of prenotazioni[2]) {
                if (elPren.ID_PREN == elRec.ID_PREN) {
                  elPren.recBoolean = true;
                } 
              }
            }
          }

          prenotazioni = prenotazioni[0];

          for (el of prenotazioni) {
            if (el.stato_prenotazione == 'conclusa') {
              prenConcluse.push(el);
            }
            else {
              prenNonConcluse.push(el);
            }
          }

          res.render('finestraListaPrenotazioniEffettuate', {data : {dataC: prenConcluse, dataNC: prenNonConcluse}});
      });
  } catch (err) {
      console.log(err);
      next(createError(500));
  }
}
  
/* GET finestraPrenotazioneEffettuata */
router.get('/finestraPrenotazioneEffettuata', getPrenotazioneEffettuata);

function getPrenotazioneEffettuata(req, res, next) {

  let prenDataArray = prenotazioni.filter((el) => { return el.ID_PREN == req.query.id });

  prenData = prenDataArray[0];

  let stato_pren = "";
  let stato_rec = "";
  let stato_pag = "";

  //check per verificare la possibilità di annullare la prenotazione o pagare
  if (prenData.stato_prenotazione == 'conclusa') {
    // METTERCI ANCHE LA DATA DI SCADENZA 

    //disabilita tasto annullamento
    stato_pren = "disabled";
    //disabilita tasto pagamento
    stato_pag = "disabled";
  }

  //check per verificare la possibilità di pagamento
  if (prenData.stato_prenotazione == 'richiesta' || prenData.stato_prenotazione == 'pagata') {

    stato_pag = "disabled";
  }

  //check per verificare la possibilità di recensire (in base a recensioni già fatte o conclusione vacanza)
  if (prenData.stato_prenotazione != 'conclusa' || prenData.recBoolean == true) {
    stato_rec = "disabled";
  }

  console.log(prenData);
  res.render('finestraPrenotazioneEffettuata', {data : {data_pren : prenData, data_rec : stato_rec, data_ann : stato_pren, data_pag : stato_pag}});    
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
            idUtente,
            prenData.ID_ALL,
            req.body.valutazione
          ];
          recensione = await db.query(sql, values)
              .catch(err => {
                  throw err;
              }); 
          
          prenData.recBoolean = true;
          
          console.log(req.body);
          //DA CANCELLARE
          console.log('DATI RECENSIONE: ');
          console.log(values);
          
          let link = '/profiloUtenteControl/finestraPrenotazioneEffettuata?id=' + prenData.ID_PREN;
          res.redirect(link);
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
  var today = new Date();

  try {
    await withTransaction(db, async() => {

      //MODIFICARE SQL ASSOLUTAMENTE
      let sql = "UPDATE Prenotazione \
                  SET stato_prenotazione = 'conclusa' \
                  WHERE ID_PREN = ?; \
                  INSERT INTO RecensisciAlloggio VALUES (UUID(),'prenotazione annullata',?,?,?,null);";
      annullamento = await db.query(sql, [prenData.ID_PREN, today, idUtente, prenData.ID_ALL])
          .catch(err => {
              throw err;
          });

      prenData.stato_prenotazione = 'conclusa';
      prenData.recBoolean = true;

      console.log('Prenotazione annullata');

      // Invio della mail di conferma annullamento
      let testo = "La prenotazione n." + prenData.ID_PREN + " è stata annullata dal cliente";
      inviaMailHost(transporter, prenData.email_uh, testo).catch(err => {throw err;});

      let link = '/profiloUtenteControl/finestraPrenotazioneEffettuata?id=' + prenData.ID_PREN;
      res.redirect(link);
    });
  } catch (err) {
      console.log(err);
      next(createError(500));
  }
}

module.exports = router;