var createError = require('http-errors');
var express = require('express');
var router = express.Router();

//variabili che mi servono

var idUtente = "";

/*carichiamo il middleware*/

const { config } = require('../db/config');
const { makeDb, withTransaction } = require('../db/dbmiddleware');

/* GET visualizzaAlloggioInserito */
router.get('/visualizzaAlloggio', function(req, res, next) {
  res.render('visualizzaAlloggio');
});


/* GET visualizzaListaAlloggiInseriti */
router.get('/visualizzaListaAlloggiInseriti', getListaPrenotazioniEffettuate);

async function getListaPrenotazioniEffettuate(req, res, next) {

  const db = await makeDb(config);
  let results = {};
  let prenConcluse = {};
  let prenNonConcluse = {};

  
    try { res.render('visualizzaListaAlloggiInseriti');
      /*await withTransaction(db, async() => {

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
      });*/
    } catch (err) {
        console.log(err);
        next(createError(500));
    }
}

module.exports = router;