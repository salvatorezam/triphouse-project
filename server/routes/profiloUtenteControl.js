var express = require('express');
var router = express.Router();
var createError = require('http-errors');
const { transporter } = require('../mailsender/mailsender-config');
const { inviaMailHost, inviaMailPagamento } = require('../mailsender/mailsender-middleware');

//informazioni che mi serve mantenere in memoria
var idUtente = "";
var prenEffettuate = {};
var prenData = {};

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
          let sql1 = "SELECT p.ID_PREN AS ID_PREN, a.ID_ALL AS ID_ALL, p.data_inizio AS data_inizio, p.data_fine AS data_fine, \
                      a.titolo AS titolo, a.indirizzo AS indirizzo, a.n_civico AS n_civico, \
                      a.citta AS citta,  a.tipo_all AS tipo_all, uh.telefono AS telefono_uh, \
                      a.nome_proprietario AS nome_proprietario, p.prezzo_totale AS prezzo_totale, uh.email AS email_uh, \
                      p.stato_prenotazione AS stato_prenotazione \
                      FROM Prenotazione p, Alloggio a , UtenteRegistrato uh \
                      WHERE p.alloggio = a.ID_ALL AND a.proprietario = uh.ID_UR AND p.utente = ? \
                      ORDER BY data_inizio DESC; \
                      SELECT p.ID_PREN AS ID_PREN, dos.nome AS nome_osp \
                      FROM Prenotazione p, DatiOspiti dos \
                      WHERE dos.prenotazione = p.ID_PREN; \
                      SELECT ra.prenotazione AS ID_PREN \
                      FROM RecensisciAlloggio ra, Alloggio a \
                      WHERE ra.alloggio = a.ID_ALL AND ra.scrittore = ?";
          prenEffettuate = await db.query(sql1, [idUtente, idUtente])
              .catch(err => {
                  throw err;
              });
          
          //unifico i risultati delle query
          for (elPren of prenEffettuate[0]) {

            //ospiti
            elPren.nomi_ospiti = "";
            if (prenEffettuate[1].length != 0) {
              for (elDatOsp of prenEffettuate[1]) {
                if (elPren.ID_PREN == elDatOsp.ID_PREN) {
                  elPren.nomi_ospiti = elPren.nomi_ospiti + elDatOsp.nome_osp + "-";
                }
              }
            }

            //recensioni
            if (prenEffettuate[2].length != 0) {
              for (elRec of prenEffettuate[2]) {
                if (elPren.ID_PREN == elRec.ID_PREN) {
                  elPren.recBoolean = true;
                } 
              }
            }
          }

          prenEffettuate = prenEffettuate[0];

          //divido le prenotazioni in concluse e non
          for (el of prenEffettuate) {
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

  //prendo i dati della prenotazione interessata
  let prenDataArray = prenEffettuate.filter((el) => { return el.ID_PREN == req.query.id });

  if (prenDataArray.length == 0) {
    next(createError(500));
  }
  else {
    prenData = prenDataArray[0];
  }

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

    //disabilita tasto pagamento
    stato_pag = "disabled";
  }

  //check per verificare la possibilità di recensire (in base a recensioni già fatte o conclusione vacanza)
  if (prenData.stato_prenotazione != 'conclusa' || prenData.recBoolean == true) {

    //disabilita tasto recensione
    stato_rec = "disabled";
  }

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
          
          let sql = "INSERT INTO RecensisciAlloggio VALUES (UUID(),?,?,?,?,?,?);";
          let values = [
            req.body.testoRec,
            today,
            idUtente,
            prenData.ID_ALL,
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

      let sql = "UPDATE Prenotazione \
                  SET stato_prenotazione = 'conclusa' \
                  WHERE ID_PREN = ?; \
                  INSERT INTO RecensisciAlloggio VALUES (UUID(),'prenotazione annullata',?,?,?,?,null);";
      annullamento = await db.query(sql, [prenData.ID_PREN, today, idUtente, prenData.ID_ALL, prenData.ID_PREN])
          .catch(err => {
              throw err;
          });

      //mi serviranno per i disabilitare i tasti recensione e annulla prenotazione
      prenData.stato_prenotazione = 'conclusa';
      prenData.recBoolean = true;

      console.log('Prenotazione annullata.');

      // Invio della mail di conferma annullamento
      let testo = "La prenotazione n." + prenData.ID_PREN + " è stata annullata dal cliente.";
      inviaMailHost(transporter, prenData.email_uh, testo).catch(err => {throw err;});

      let link = '/profiloUtenteControl/finestraPrenotazioneEffettuata?id=' + prenData.ID_PREN;
      res.redirect(link);

    });
  } catch (err) {
      console.log(err);
      next(createError(500));
  }
}

/* Pagamento */
router.post('/pagamento', pagamento);

async function pagamento(req, res, next) {

  const db = await makeDb(config);
  let last4digits = req.body.numeroCarta.toString().slice(15,19);
  let today = new Date().toString().slice(0,24);

  try {
    await withTransaction(db, async() => {

      let sql = "UPDATE Prenotazione \
                  SET stato_prenotazione = 'pagata' \
                  WHERE ID_PREN = ?;";
      paga = await db.query(sql, prenData.ID_PREN)
          .catch(err => {
              throw err;
          });
      
      //mi servirà per disabilitare il tasto pagamento
      prenData.stato_prenotazione = 'pagata';

      console.log('Pagamento avvenuto.');

      // Invio della mail di pagamento avvenuto
      let testo = "Il pagamento per la prenotazione n." + prenData.ID_PREN + " è stato effettuato con successo. \n\nNome titolare carta: " + req.body.titolareCarta + " \nCarta di credito: xxxx-xxxx-xxxx-" + last4digits + " \nPagamento avvenuto in data: " + today + ".";
      inviaMailPagamento(transporter, prenData.email_uh, testo).catch(err => {throw err;});

      let link = '/profiloUtenteControl/finestraPrenotazioneEffettuata?id=' + prenData.ID_PREN;
      res.redirect(link);

    });
  } catch (err) {
      console.log(err);
      next(createError(500));
  }
}

module.exports = router;