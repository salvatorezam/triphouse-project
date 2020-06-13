var express = require('express');
var router = express.Router();
var createError = require('http-errors');
const { transporter } = require('../mailsender/mailsender-config');
const { inviaMailCliente, inviaMailConferma, inviaMailDeclinazione } = require('../mailsender/mailsender-middleware');

const mesi = [
  "meseZero",
  "Gen",
  "Feb",
  "Mar",
  "Apr",
  "Mag",
  "Giu",
  "Lug",
  "Ago",
  "Set",
  "Ott",
  "Nov",
  "Dic"
];

const dataGiornoMeseAnno = function(data) {
  data = data.split('/');
  return (data[0] + ' ' + mesi[parseInt(data[1])] + ' ' + data[2]);
};

//informazioni che mi serve mantenere in memoria
var idUtente = "";
var prenRicevute = {};
var prenData = {};

const { config } = require('../db/config');
const { makeDb, withTransaction } = require('../db/dbmiddleware');

/* GET finestraListaPrenotazioniRicevute */
router.get('/finestraListaPrenotazioniRicevute', getListaPrenotazioniRicevute);

async function getListaPrenotazioniRicevute(req, res, next) {
    
    const db = await makeDb(config);

    try {
        await withTransaction(db, async() => {

            //recupero l'id utente dalla sessione per poter interrogare il database
            let utente = req.app.locals.users.get(req.session.user.id_utente);

            if (utente) {
              idUtente = utente.id_utente;
            }
            else {
              console.log('Sessione Utente non trovata!');
              next(createError(404, 'Sessione Utente non trovata'));
            }
            
            //prendo dal database tutte le informazioni che mi servono
            let sql1 = "SELECT p.ID_PREN AS ID_PREN, p.data_inizio AS data_inizio, p.data_fine AS data_fine, \
                        a.titolo AS titolo, a.tipo_all AS tipo_all, a.indirizzo AS indirizzo, a.n_civico AS n_civico, \
                        a.citta AS citta, a.tasse AS tasse_alloggio, p.stato_prenotazione AS stato_prenotazione, \
                        ur.nome AS nome_ut, ur.cognome AS cognome_ut, ur.telefono AS telefono_ut, \
                        ur.email AS email_ut, ur.nazione_nascita AS naz_prenotante, DATEDIFF(CURDATE(),ur.data_nascita)/365 AS eta_prenotante, \
                        ur.ID_UR AS ID_UR, \
                        p.prezzo_totale AS prezzo_totale, p.data_pren AS data_prenotazione, \
                        dur.tipo_doc AS tipo_doc_ur, dur.num_doc AS num_doc_ur, dur.scadenza_doc AS scadenza_doc_ur, \
                        a.foto_0 AS foto_0, a.foto_1 AS foto_1, a.foto_2 AS foto_2, \
                        a.foto_3 AS foto_3, a.foto_4 AS foto_4, a.foto_5 AS foto_5 \
                        FROM DocumentiUtenteR dur, Prenotazione p, Alloggio a, UtenteRegistrato ur \
                        WHERE dur.prenotazione = p.ID_PREN AND p.alloggio = a.ID_ALL AND p.utente = ur.ID_UR AND a.proprietario = ? \
                        GROUP BY p.ID_PREN \
                        ORDER BY data_inizio DESC; \
                        SELECT p.ID_PREN AS ID_PREN, dos.nome AS nome_osp, dos.nazionalita AS naz_osp, dos.eta AS eta_osp \
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

                elPren.data_inizio = dataGiornoMeseAnno(elPren.data_inizio.toLocaleDateString());
                elPren.data_fine = dataGiornoMeseAnno(elPren.data_fine.toLocaleDateString());
                elPren.data_prenotazione = dataGiornoMeseAnno(elPren.data_prenotazione.toLocaleDateString());
  
                //ospiti
                elPren.nomi_ospiti = "";
                elPren.naz_ospiti = "";
                elPren.eta_ospiti = "";
                elPren.num_ospiti = 0;
                if (prenRicevute[1].length != 0) {
                    for (elDatOsp of prenRicevute[1]) {
                        if (elPren.ID_PREN == elDatOsp.ID_PREN) {
                            elPren.nomi_ospiti = elPren.nomi_ospiti + elDatOsp.nome_osp + "-";
                            elPren.naz_ospiti = elPren.naz_ospiti + elDatOsp.naz_osp + "-";
                            elPren.eta_osp = elPren.eta_ospiti + elDatOsp.eta_osp + "-";
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
  
  //prendo i dati della prenotazione interessata
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

  let data_inizio_check = new Date(prenData.data_inizio);
  let today = new Date();

  //L'host può annullare la prenotazione fino a 7 giorni prima
  if ((data_inizio_check - today) < (7*86400000)) {

    //disabilita tasto annullamento
    stato_pren = "disabled";
  }

  //check per verificare la possibilità di annullare la prenotazione
  if (prenData.stato_prenotazione == 'conclusa') {
    // METTERCI ANCHE LA DATA DI SCADENZA 

    //disabilita tasto annullamento
    stato_pren = "disabled";
  }

  //check per verificare la possibilità di annullamento o conferma
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
          
          let sql = "INSERT INTO RecensisciCliente VALUES (UUID(),?,?,?,?,?,?);";
          let values = [
            req.body.testoRec,
            today,
            idUtente,
            prenData.ID_UR,
            prenData.ID_PREN,
            req.body.valutazione
          ];
          recensione = await db.query(sql, values)
              .catch(err => {
                  throw err;
              });
          
          //mi servirà per disabilitare il tasto di recensione
          prenData.recBoolean = true;
          
          console.log('Recensione completata.');
          
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
  let today = new Date();

  try {
    await withTransaction(db, async() => {

      let sql = "UPDATE Prenotazione \
                  SET stato_prenotazione = 'conclusa' \
                  WHERE ID_PREN = ?; \
                  INSERT INTO RecensisciCliente VALUES (UUID(),'prenotazione annullata',?,?,?,?,null);";
      annullamento = await db.query(sql, [prenData.ID_PREN, today, idUtente, prenData.ID_UR, prenData.ID_PREN])
          .catch(err => {
              throw err;
          });
      
      //mi serviranno per i disabilitare i tasti recensione e annulla prenotazione
      prenData.stato_prenotazione = 'conclusa';
      prenData.recBoolean = true;

      console.log('Prenotazione annullata.');

      // Invio della mail di conferma annullamento
      let testo = "La prenotazione n." + prenData.ID_PREN + " è stata annullata dall' host.";
      inviaMailCliente(transporter, prenData.email_ut, testo).catch(err => {throw err;});

      let link = '/profiloHostControl/finestraPrenotazioneRicevuta?id=' + prenData.ID_PREN;
      res.redirect(link);

    });
  } catch (err) {
      console.log(err);
      next(createError(500));
  }
}

/* Accetta Prenotazione */
router.get('/accettaPrenotazione', accettaPrenotazione);

async function accettaPrenotazione(req, res, next) {

  const db = await makeDb(config);

  try {
    await withTransaction(db, async() => {

      let sql = "UPDATE Prenotazione \
                  SET stato_prenotazione = 'confermata' \
                  WHERE ID_PREN = ?;";
      accetta = await db.query(sql, prenData.ID_PREN)
          .catch(err => {
              throw err;
          });
      
      //mi servirà per disabilitare il tasto gestisci prenotazione
      prenData.stato_prenotazione = 'confermata';

      console.log('Prenotazione confermata');

      // Invio della mail di conferma
      let testo = "La prenotazione n." + prenData.ID_PREN + " è stata accettata dall' host.";
      inviaMailConferma(transporter, prenData.email_ut, testo).catch(err => {throw err;});

      let link = '/profiloHostControl/finestraPrenotazioneRicevuta?id=' + prenData.ID_PREN;
      res.redirect(link);

    });
  } catch (err) {
      console.log(err);
      next(createError(500));
  }
}

/* Declina Prenotazione */
router.get('/declinaPrenotazione', declinaPrenotazione);

async function declinaPrenotazione(req, res, next) {

  const db = await makeDb(config);
  let today = new Date()

  try {
    await withTransaction(db, async() => {

      let sql = "UPDATE Prenotazione \
                  SET stato_prenotazione = 'conclusa' \
                  WHERE ID_PREN = ?; \
                  INSERT INTO RecensisciCliente VALUES (UUID(),'prenotazione declinata',?,?,?,?,null);";
      accetta = await db.query(sql, [prenData.ID_PREN, today, idUtente, prenData.ID_UR, prenData.ID_PREN])
          .catch(err => {
              throw err;
          });
      
      //mi servirà per disabilitare i tasti gestisci prenotazione e recensione
      prenData.stato_prenotazione = 'conclusa';
      prenData.recBoolean = true;

      console.log('Prenotazione declinata');

      // Invio della mail di declinazione
      let testo = "La prenotazione n." + prenData.ID_PREN + " è stata DECLINATA dall' host. Siamo spiacenti.";
      inviaMailDeclinazione(transporter, prenData.email_ut, testo).catch(err => {throw err;});

      let link = '/profiloHostControl/finestraPrenotazioneRicevuta?id=' + prenData.ID_PREN;
      res.redirect(link);

    });
  } catch (err) {
      console.log(err);
      next(createError(500));
  }
}


/* Calcola tasse */
router.post('/inviatasse', inviaTasse);

async function inviaTasse(req, res, next) {

  const db = await makeDb(config);

  try {
    await withTransaction(db, async() => {

      results = await db.query('UPDATE Prenotazione SET tasse_pagate = ? WHERE ID_PREN = ?', [req.body.tasse, prenData.ID_PREN])
              .catch(err => {
                throw err;
              });

      res.send('UPDATE-SUCCESSFUL');
    });
  } catch (err) {
      console.log(err);
      next(createError(500));
  }
}
  

router.get('/finestraCalcolaGuadagni', calcolaGuadagni);

async function calcolaGuadagni(req, res, next) {

  const db = await makeDb(config);

  try {
    await withTransaction(db, async() => {

      let utente = req.app.locals.users.get(req.session.user.id_utente);

      results = await db.query('SELECT a.titolo AS titolo, pr.data_inizio AS data_inizio, pr.data_fine AS data_fine, (DATEDIFF(pr.data_fine,pr.data_inizio))*a.prezzo AS prezzo_totale\
                                FROM UtenteRegistrato ur, Alloggio a, Prenotazione pr \
                                WHERE ur.ID_UR = a.proprietario AND a.ID_ALL = pr.alloggio AND pr.stato_prenotazione = \'conclusa\';', utente)
              .catch(err => {
                throw err;
              });

      res.render('finestraCalcolaGuadagni', { data : results });
    });
  } catch (err) {
      console.log(err);
      next(createError(500));
  }
}

module.exports = router;