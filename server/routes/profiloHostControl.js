var express = require('express');
var router = express.Router();
var createError = require('http-errors');
const { transporter } = require('../mailsender/mailsender-config');
const { inviaMailCliente } = require('../mailsender/mailsender-middleware');

//creo degli array per salvare gli id delle prenotazioni
var idUtente = "";
var prenRicevute = {};
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

            let sql1 = "SELECT p.ID_PREN AS ID_PREN, p.data_inizio AS data_inizio, p.data_fine AS data_fine, \
                        a.titolo AS titolo, a.tipo_all AS tipo_all, a.indirizzo AS indirizzo, a.n_civico AS n_civico, \
                        a.citta AS citta, p.stato_prenotazione AS stato_prenotazione, \
                        ur.nome AS nome_ut, ur.cognome AS cognome_ut, ur.telefono AS telefono_ut, \
                        ur.email AS email_ut, ur.ID_UR AS ID_UR, \
                        p.prezzo_totale AS prezzo_totale, p.data_pren AS data_prenotazione \
                        FROM Prenotazione p, Alloggio a, UtenteRegistrato ur \
                        WHERE p.alloggio = a.ID_ALL AND p.utente = ur.ID_UR AND a.proprietario = ? \
                        GROUP BY p.ID_PREN; \
                        SELECT p.ID_PREN AS ID_PREN, dos.nome AS nome_osp \
                        FROM Prenotazione p, DatiOspiti dos \
                        WHERE p.ID_PREN = dos.prenotazione; \
                        SELECT rc.prenotazione AS ID_PREN \
                        FROM RecensisciCliente rc, UtenteRegistrato ur\
                        WHERE rc.ricevente = ur.ID_UR AND rc.scrittore = ?;";
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

            res.render('finestraListaPrenotazioniRicevute', {data : prenRicevute});
        });
    } catch (err) {
        console.log(err);
        next(createError(500));
    }
}
  
/* GET finestraPrenotazioneRicevuta */
router.get('/finestraPrenotazioneRicevuta', getPrenotazioneRicevuta);

function getPrenotazioneRicevuta(req, res, next) {
 
  let prenDataArray = prenRicevute.filter((el) => { return el.ID_PREN == req.query.id });
  
  if (prenDataArray.length == 0) {
    next(createError(500));
  }
  else {
    prenData = prenDataArray[0];
  }

  let stato_pren = "";
  let stato_rec = "";
  let stato_conf = "disabled";

  //check per verificare la possibilità di annullare la prenotazione o pagare
  if (prenData.stato_prenotazione == 'conclusa') {
    // METTERCI ANCHE LA DATA DI SCADENZA 

    //disabilita tasto annullamento
    stato_pren = "disabled";
  }

  //check per verificare la possibilità di pagamento
  if (prenData.stato_prenotazione == 'richiesta') {

    //disabilita tasto annullamento
    stato_pren = "disabled";

    //abilita tasto conferma
    stato_conf = "";
  }

  //check per verificare la possibilità di recensire (in base a recensioni già fatte o conclusione vacanza)
  if (prenData.stato_prenotazione != 'conclusa' || prenData.recBoolean == true) {

    //disabilita tasto recensione
    stato_rec = "disabled";
  }

  res.render('finestraPrenotazioneRicevuta', {data : {data_pren : prenData, data_rec : stato_rec, data_ann : stato_pren, data_conf : stato_conf}});        
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
            idUtente,
            prenData.ID_UR,
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
          
          let link = '/profiloHostControl/finestraPrenotazioneRicevuta?id=' + prenData.ID_PREN;
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
  var today = new Date()

  try {
    await withTransaction(db, async() => {

      let sql = "UPDATE Prenotazione \
                  SET stato_prenotazione = 'conclusa' \
                  WHERE ID_PREN = ?; \
                  INSERT INTO RecensisciCliente VALUES (UUID(),'prenotazione annullata,?,?,?,null);";
      annullamento = await db.query(sql, [prenData.ID_PREN, today, idUtente, prenData.ID_UR])
          .catch(err => {
              throw err;
          });
      
      prenData.stato_prenotazione = 'conclusa';
      prenData.recBoolean = true;

      console.log('Prenotazione annullata');

      // Invio della mail di conferma annullamento
      let testo = "La prenotazione n." + prenData.ID_PREN + " è stata annullata dall' host";
      inviaMailCliente(transporter, prenData.email_ut, testo).catch(err => {throw err;});

      let link = '/profiloHostControl/finestraPrenotazioneRicevuta?id=' + prenData.ID_PREN;
      res.redirect(link);

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