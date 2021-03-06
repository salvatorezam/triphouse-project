var express = require('express');
var router = express.Router();
var createError = require('http-errors');
const { transporter } = require('../mailsender/mailsender-config');
const { inviaMailCliente, inviaMailConferma, inviaMailDeclinazione, inviaMailResoconto } = require('../mailsender/mailsender-middleware');

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

//DICHIARO MULTER PER FOTO

var multer  = require('multer');

const storage = multer.diskStorage({
  destination: function(req, file, cb){             //destination viene utilizzato per determinare in quale cartella devono essere archiviati i file caricati.
    cb(null, './public/images/uploads/documentiPrenotazione')
  },
  filename: function(req, file, cb){                //filenameviene utilizzato per determinare il nome del file all'interno della cartella
    console.log('uploaded' + file.originalname)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + '-' + file.originalname.slice(file.originalname.length-7,file.originalname.length))
    //fileName = file.originalname
    console.log("il nome è: "+ file.originalname)
  }
});

var upload1 = multer({ storage: storage }).array('fileToUpload',2);

var upload2 = multer({ storage: storage }).array('fileToUpload',2);


//informazioni che mi serve mantenere in memoria
var idUtente = "";
var prenRicevute = {};
var prenData = {};
var utenteMail = "";
var jsonResocontoTrimestrale;

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
              utenteMail = utente.email;
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
                        ur.email AS email_ut, ur.nazione_nascita AS naz_prenotante, FLOOR(DATEDIFF(CURDATE(),ur.data_nascita)/365) AS eta_prenotante, \
                        ur.ID_UR AS ID_UR, \
                        p.prezzo_totale AS prezzo_totale, p.data_pren AS data_prenotazione, \
                        dur.tipo_doc AS tipo_doc_ur, dur.num_doc AS num_doc_ur, dur.scadenza_doc AS scadenza_doc_ur, \
                        dur.foto_fronte_doc AS foto_fronte_doc_dur, dur.foto_retro_doc AS foto_retro_doc_dur, \
                        dur.ID_DUR AS ID_DUR,a.foto_0 AS foto_0, a.foto_1 AS foto_1, a.foto_2 AS foto_2, \
                        a.foto_3 AS foto_3, a.foto_4 AS foto_4, a.foto_5 AS foto_5 \
                        FROM DocumentiUtenteR dur, Prenotazione p, Alloggio a, UtenteRegistrato ur \
                        WHERE dur.prenotazione = p.ID_PREN AND p.alloggio = a.ID_ALL AND p.utente = ur.ID_UR AND a.proprietario = ? \
                        GROUP BY p.ID_PREN \
                        ORDER BY data_inizio DESC; \
                        SELECT p.ID_PREN AS ID_PREN, dos.ID_DO AS ID_DO, dos.nome AS nome_osp, dos.cognome AS cognome_osp, \
                        dos.tipo_doc AS tipo_doc, dos.foto_fronte_doc AS foto_fronte_doc, dos.num_doc AS num_doc_osp,\
                        dos.foto_retro_doc AS foto_retro_doc, dos.nazionalita AS naz_osp, \
                        dos.scadenza_doc AS scadenza_doc, dos.eta AS eta_osp \
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

                //elPren.data_inizio = dataGiornoMeseAnno(elPren.data_inizio.toLocaleDateString());
                //elPren.data_fine = dataGiornoMeseAnno(elPren.data_fine.toLocaleDateString());
                //elPren.data_prenotazione = dataGiornoMeseAnno(elPren.data_prenotazione.toLocaleDateString());

                // per salvo - eventualmente commentare

                elPren.data_inizio_num = elPren.data_inizio;
                elPren.data_fine_num = elPren.data_fine;
                
                elPren.data_inizio = elPren.data_inizio.toDateString();
                elPren.data_fine = elPren.data_fine.toDateString();
                elPren.data_prenotazione = elPren.data_prenotazione.toDateString();

                elPren.data_inizio_num = elPren.data_inizio;
                elPren.data_fine_num = elPren.data_fine;
  
                //ospiti
                elPren.nomi_ospiti = "";
                elPren.naz_ospiti = "";
                elPren.eta_osp = "";
                elPren.tipo_doc_ospiti = "";
                elPren.num_doc_ospiti = "";
                elPren.scadenze_doc_ospiti = "";
                elPren.num_ospiti = 0;
                if (prenRicevute[1].length != 0) {
                    for (elDatOsp of prenRicevute[1]) {
                        if (elPren.ID_PREN == elDatOsp.ID_PREN) {
                            elPren.nomi_ospiti = elPren.nomi_ospiti + elDatOsp.nome_osp + "-";
                            elPren.naz_ospiti = elPren.naz_ospiti + elDatOsp.naz_osp + "-";
                            elPren.eta_osp = elPren.eta_osp + elDatOsp.eta_osp + "-";
                            elPren.tipo_doc_ospiti = elPren.tipo_doc_ospiti + elDatOsp.tipo_doc + "-";
                            elPren.num_doc_ospiti = elPren.num_doc_ospiti + elDatOsp.num_doc_osp + "-";
                            elPren.scadenze_doc_ospiti = elPren.scadenze_doc_ospiti + elDatOsp.scadenza_doc + "-";
                            elPren.foto_fronte_doc = elDatOsp.foto_fronte_doc;
                            elPren.ID_DO = elDatOsp.ID_DO;
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

      // le tasse devono essere pagate per ogni giorno della permanenza fino al terzo giorno
      var finalDate = new Date(prenData.data_fine);
      var startDate = new Date(prenData.data_inizio);
      var giorniPrenotazine = finalDate - startDate;
      if (giorniPrenotazine > 3) giorniPrenotazine = 3;

      // aggiorno le tasse pagate nel db in relazione ai dati della prenotazione e degli ospiti
      results = await db.query('UPDATE Prenotazione SET tasse_pagate = ? WHERE ID_PREN = ?', 
      [
        req.body.tasse * giorniPrenotazine,
        prenData.ID_PREN
      ])
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


/* Calcola tasse */
router.post('/inviadocumenti', inviaDocumenti);

async function inviaDocumenti(req, res, next) {

  const db = await makeDb(config);

  try {
    await withTransaction(db, async() => {

      //reperiamo i dati degli ospiti della prenotazione e li stampiamo 
      let results = await db.query("SELECT ur.nome AS nome, ur.cognome AS cognome, dur.tipo_doc AS tipo_doc_ur, dur.num_doc AS num_doc_ur, \
                                    dur.scadenza_doc AS scadenza_doc, dur.foto_fronte_doc AS foto_fronte_doc_ur, dur.foto_retro_doc AS foto_retro_doc_ur, \
                                    do.nome AS nome_do, do.cognome AS cognome_do, do.tipo_doc AS tipo_doc_do, do.num_doc AS num_doc_do,  \
                                    do.foto_fronte_doc AS foto_fronte_doc_do, do.foto_retro_doc AS foto_retro_doc_do\
                                    FROM UtenteRegistrato ur, Prenotazione pr, DocumentiUtenteR dur, DatiOspiti do \
                                    WHERE ur.ID_UR = PR.utente AND pr.ID_PREN = ? AND pr.ID_PREN = dur.prenotazione AND pr.ID_PREN = do.prenotazione;", 
                                    [
                                      prenData.ID_PREN
                                    ])
                    .catch(err => {
                      throw err;
                    });

      let jsonDocumentiOspiti = JSON.stringify(results); 

      console.log(jsonDocumentiOspiti);

      var utente = req.app.locals.users.get(req.session.user.id_utente);

      inviaMailResoconto(transporter, 'ufficio@questura.gov',
                                  utente.email,
                                  jsonDocumentiOspiti);

      res.send('EMAIL-SENT');
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

      // individuo l'utente che sta facendo la richiesta tramite la sessione
      var utente = req.app.locals.users.get(req.session.user.id_utente);

      // ricavo i guadagni delle prenotazioni concluse relative agli alloggi dell'utente
      results = await db.query('SELECT a.titolo AS titolo, pr.data_inizio AS data_inizio, pr.data_fine AS data_fine, pr.prezzo_totale AS prezzo_totale\
                                FROM Alloggio a, Prenotazione pr \
                                WHERE a.proprietario = ? AND a.ID_ALL = pr.alloggio AND pr.stato_prenotazione = \'conclusa\';', utente.id_utente)
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

router.get('/finestraResocontoTrimestrale', visualizzaResocontoTrimestrale);

// invio resoconto trimestrale automatico
async function visualizzaResocontoTrimestrale(req, res, next) {

  const db = await makeDb(config);

  try {

    // ricaviamo l'utente dalla sessione
    var utente = req.app.locals.users.get(req.session.user.id_utente);

    var trimestri = [ 
      {
        inizio : '01-01',
        fine : '03-31'
      },
      {
        inizio : '04-01',
        fine : '06-31'
      },
      {
        inizio : '07-01',
        fine : '09-30'
      },
      {
        inizio : '10-01',
        fine : '12-31'
      }
    ];

    // ricaviamo la data di oggi 
    let today = new Date();
    var day = today.getDate();
    var month = today.getMonth()+1; 
    var year = today.getFullYear();
    
    if(day<10) day='0'+day; 
    if(month<10) month='0'+month;

    // scegliamo il trimestre di interesse 
    for (let i = 0; i < trimestri.length; i++) 
      if (month >= trimestri[i].inizio.split('-')[0] && month <= trimestri[i].fine.split('-')[0]) {
        var trimestrePassato = (i - 1) % 4;
        
      }

    // consideriamo il caso in cui il trimestre si riferisce all'anno passato
    if (trimestrePassato == 3) year = parseInt(year)-1;

    // ricaviamo i dati sulle tasse e sugli ospiti delle prenotazioni del trimestre
    let prenotazioniTrimestre = await db.query("SELECT pr.ID_PREN AS ID_PREN, a.titolo AS titolo, a.citta AS citta, pr.data_inizio AS data_inizio, \
                                                pr.data_fine AS data_fine, pr.tasse_pagate, ur.nazione_nascita AS nazione_nascita, FLOOR(DATEDIFF(CURDATE(),ur.data_nascita)/365) AS eta_ur, \
                                                do.nazionalita AS nazionalita_do, do.eta AS eta_do  \
                                                FROM Alloggio a, Prenotazione pr, DocumentiUtenteR dur, DatiOspiti do, UtenteRegistrato ur\
                                                WHERE a.proprietario = ? AND a.ID_ALL = pr.alloggio AND pr.ID_PREN = dur.prenotazione AND pr.utente = ur.ID_UR AND do.prenotazione = pr.ID_PREN \
                                                AND pr.data_inizio >= ? AND pr.data_fine <= ? AND pr.stato_prenotazione = \'conclusa\' ", 
                                                [
                                                  utente.id_utente,
                                                  year+'-'+trimestri[trimestrePassato].inizio,
                                                  year+'-'+trimestri[trimestrePassato].fine,
                                                ]).
                                      catch(err => {
                                        throw err;
                                      });
    
    jsonResocontoTrimestrale = JSON.stringify(prenotazioniTrimestre);

    console.log(jsonResocontoTrimestrale);

    res.render('finestraResocontoTrimestrale', { data : prenotazioniTrimestre });

  } catch (err) {
    console.log(err);
    next(createError(500));
  }

};


// modifica documenti DUR

router.post('/modificaDocumentiDur', upload1, async function(req, res, next){

    try {
        
      //AGGIORNAMENTO FOTO

      let arrayFoto = [];


      if(req.files && req.files.length != 0){
          for(var x  = 0; x < req.files.length; x++){
              arrayFoto[x]= req.files[x].filename;
          }

          (arrayFoto[0] ? prenData.foto_fronte_doc_dur = arrayFoto[0]  : prenData.foto_fronte_doc_dur = undefined);
          (arrayFoto[1] ? prenData.foto_retro_doc_dur = arrayFoto[1]  : prenData.foto_retro_doc_dur = undefined);

          const db = await makeDb(config); 
        var results = {};

        await withTransaction(db, async() => {
        
        let sql = "UPDATE DocumentiUtenteR SET foto_fronte_doc = ?, foto_retro_doc = ? WHERE ID_DUR = ?";
        let values = [
            prenData.foto_fronte_doc_dur,
            prenData.foto_retro_doc_dur,
            prenData.ID_DUR
        ];

        results = await db.query(sql, values)
                .catch(err => {
                    throw err;
                });

        });

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

    } catch (err) {
      console.log(err);
      next(createError(500));
    }
});

// modifica documenti OSPITI

router.post('/modificaDocumentiOspiti', upload2, async function(req, res, next){

  try {
        
      //AGGIORNAMENTO FOTO

      let arrayFoto = [];


      if(req.files && req.files.length != 0){
          for(var x  = 0; x < req.files.length; x++){
              arrayFoto[x]= req.files[x].filename;
          }

          (arrayFoto[0] ? prenData.foto_fronte_doc = arrayFoto[0]  : prenData.foto_fronte_doc = undefined);
          (arrayFoto[1] ? prenData.foto_retro_doc = arrayFoto[1]  : prenData.foto_retro_doc = undefined);

          const db = await makeDb(config); 
        var results = {};

        await withTransaction(db, async() => {
        
        let sql = "UPDATE DatiOspiti SET foto_fronte_doc = ?, foto_retro_doc = ? WHERE ID_DO = ?";
        let values = [
            prenData.foto_fronte_doc,
            prenData.foto_retro_doc,
            prenData.ID_DO
        ];

        results = await db.query(sql, values)
                .catch(err => {
                    throw err;
                });

        });

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
   

  } catch (err) {
    console.log(err);
    next(createError(500));
  }
});



router.post('/inviaresocontotrimestrale', inviaResocontoTrimestrale);

async function inviaResocontoTrimestrale(req, res, next) {

  const db = await makeDb(config);

  try {
    await withTransaction(db, async() => {

      var utente = req.app.locals.users.get(req.session.user.id_utente);

      inviaMailResoconto(transporter, 'ufficio@turismo.gov',
                                  utente.email,
                                  jsonResocontoTrimestrale);

      res.send('EMAIL-SENT');

    });
  } catch (err) {
      console.log(err);
      next(createError(500));
  }
}


module.exports = router;