var express = require('express');
var router = express.Router();
var createError = require('http-errors');
const { transporter } = require('../mailsender/mailsender-config');
const { inviaMailCliente } = require('../mailsender/mailsender-middleware');

//creo degli array per salvare gli id delle prenotazioni
var idUtente = "";
var preRicevute = {};
var prenData = {};

//const crypto = require('crypto');
const { config } = require('../db/config');
const { makeDb, withTransaction } = require('../db/dbmiddleware');

/* GET finestraListaPrenotazioniRicevute */
router.get('/finestraListaPrenotazioniRicevute', getListaPrenotazioniRicevute);

async function getListaPrenotazioniRicevute(req, res, next) {
    
    const db = await makeDb(config);

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

            //DA DEFINIRE
            let sql1 = "SELECT p.ID_PREN AS ID_PREN, p.data_inizio AS data_inizio, p.data_fine AS data_fine, \
                        a.titolo AS titolo, a.tipo_all AS tipo_all, a.indirizzo AS indirizzo, a.n_civico AS n_civico, \
                        a.citta AS citta, p.stato_prenotazione AS stato_prenotazione, \
                        ur.nome AS nome_ut, ur.cognome AS cognome_ut, ur.telefono AS telefono_ut, \
                        ur.email AS email_ut, \
                        p.prezzo_totale AS prezzo_totale, p.data_pren AS data_prenotazione \
                        FROM Prenotazione p, Alloggio a, UtenteRegistrato ur \
                        WHERE p.alloggio = a.ID_ALL AND p.utente = ur.ID_UR AND a.proprietario = ? \
                        GROUP BY p.ID_PREN; \
                        SELECT p.ID_PREN AS ID_PREN, dos.nome AS nome_osp \
                        FROM Prenotazione p, DatiOspiti dos \
                        WHERE p.ID_PREN = dos.prenotazione; \
                        SELECT p.ID_PREN \
                        FROM RecensisciCliente rc, UtenteRegistrato ur, Prenotazione p \
                        WHERE rc.ricevente = ur.ID_UR AND p.utente = ur.ID_UR AND rc.scrittore = ?;";
            prenRicevute = await db.query(sql1, [idUtente, idUtente])
                .catch(err => {
                    throw err;
                });

            //unifico i risultati delle query
            for (elPren of prenRicevute[0]) {

                //ospiti
                elPren.nomi_ospiti = "";
                elPren.num_ospiti = 0;
                if (prenRicevute[1].length != 0) {
                    for (elDatOsp of prenRicevute[1]) {
                        if (elPren.ID_PREN == elDatOsp.ID_PREN) {
                            elPren.nomi_ospiti = elPren.nomi_ospiti + elDatOsp.nome_osp + "-";
                            elPren.num_ospiti++;
                        }
                    }
                }

                //recensioni
                if (prenRicevute[2].length != 0) {
                    for (elRec of prenRicevute[2]) {
                        if (elPren.ID_PREN == elRec.ID_PREN) {
                            elPren.recBoolean = true;
                        }
                    }
                }
            }

            prenRicevute = prenRicevute[0];

            // CONTROLLARE QUESTO CASO D'USO, MI SONO FERMATO PER FARE LA NAVBAR

            //DA CANCELLARE
            console.log('prenotazioni RICEVUTE');
            console.log(prenRicevute.length);
            console.log({data : prenRicevute});

            res.render('finestraListaPrenotazioniRicevute', {data : prenRicevute});
        });
    } catch (err) {
        console.log(err);
        next(createError(500));
    }
}
  
/* GET finestraPrenotazioneRicevuta */
router.get('/finestraPrenotazioneRicevuta', getPrenotazioneRicevuta);
async function getPrenotazioneRicevuta(req, res, next) {
  const db = await makeDb(config);
  let prenData = {};
  let recData = {};
  try {
      await withTransaction(db, async() => {
          //dati prenotazione che mi servono
          let sql = "SELECT p.data_inizio AS data_inizio, p.data_fine AS data_fine, \
                      a.titolo AS titolo, a.indirizzo AS indirizzo, a.n_civico AS n_civico, \
                      a.citta AS citta, ur.telefono AS telefono_ut, a.tipo_all AS tipo_all, \
                      ur.nome AS nome_ut, ur.cognome AS cognome_ut, p.prezzo_totale AS prezzo_totale, ur.email AS email_ut, \
                      p.stato_prenotazione AS stato_prenotazione, dos.nome AS nome_osp \
                      FROM Prenotazione p, Alloggio a, UtenteRegistrato ur, DatiOspiti dos \
                      WHERE p.alloggio = a.ID_ALL AND p.utente = ur.ID_UR AND dos.prenotazione = p.ID_PREN;"; //DA DEFINIRE
          prenData = await db.query(sql)
              .catch(err => {
                  throw err;
              });
          //FARE CHECK PER DISABILITARE I BUTTON
          /*dati recensione
          let sql_rec = "SELECT * FROM RecensioneCliente;"; //DA DEFINIRE
          
          recData = await db.query(sql_rec)
              .catch(err => {
                  throw err;
              });
          */
          //FARE CHECK PER DISABILITARE I BUTTON
          
          //DA CANCELLARE
          console.log('DATI PRENOTAZIONE: ');
          console.log(prenData);
          //console.log('DATI RECENSIONE: ');
          //console.log(stato_rec);
          res.render('finestraPrenotazioneRicevuta', {data : {data_pren : prenData /*e altro*/}});
      });
  } catch (err) {
      console.log(err);
      next(createError(500));
  }
}

  /* Recensisci Cliente */
router.post('/recensisciCliente', recensisciCliente);

async function recensisciCliente(req, res, next) {

  const db = await makeDb(config);
  let recensione = {};
  var today = new Date();

  try {
      await withTransaction(db, async() => {
          
          let sql = "INSERT INTO RecensisciCliente VALUES (UUID(),?,?,?,?,?);";
          let values = [
            req.body.testoRec,
            today,
            'scrittore_rec',
            'cliente_recensito',
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
          
          res.redirect('/profiloHostControl/finestraPrenotazioneRicevuta');
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
      res.redirect('/profiloHostControl/finestraPrenotazioneRicevuta');
    });
  } catch (err) {
      console.log(err);
      next(createError(500));
  }
}
  
/* GET finestraComDatiOspiti */
router.get('/finestraComDatiOspiti', function(req, res, next) {
  res.render('finestraComDatiOspiti');
});

module.exports = router;