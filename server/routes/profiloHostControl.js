var express = require('express');
var router = express.Router();
var createError = require('http-errors');

//creo degli array per salvare gli id delle prenotazioni
var listaIdPrenRicevute = [];

//const crypto = require('crypto');
const { config } = require('../db/config');
const { makeDb, withTransaction } = require('../db/dbmiddleware');

/* GET finestraListaPrenotazioniRicevute */
router.get('/finestraListaPrenotazioniRicevute', getListaPrenotazioniRicevute);

async function getListaPrenotazioniRicevute(req, res, next) {
    
    const db = await makeDb(config);
    let prenRicevute = {};

    try {
        await withTransaction(db, async() => {

            //DA DEFINIRE
            let sql = "SELECT p.ID_PREN AS ID_PREN, p.data_inizio AS data_inizio, p.data_fine AS data_fine, \
                        a.titolo AS titolo, a.tipo_all AS tipo_all, p.stato_prenotazione AS stato_prenotazione, \
                        ur.nome AS nome_ut, ur.cognome AS cognome_ut, p.prezzo_totale AS prezzo_totale, p.data_pren AS data_prenotazione, \
                        count(dos.ID_DO) AS num_ospiti \
                        FROM Prenotazione p, Alloggio a, UtenteRegistrato ur, DatiOspiti dos \
                        WHERE p.alloggio = a.ID_ALL AND p.utente = ur.ID_UR AND dos.prenotazione = p.ID_PREN \
                        GROUP BY p.ID_PREN;";
            prenRicevute = await db.query(sql)
                .catch(err => {
                    throw err;
                });

            for (el of prenRicevute) {
                listaIdPrenRicevute.push(el.ID_PREN);
            }

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