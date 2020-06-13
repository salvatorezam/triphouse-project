var createError = require('http-errors');
var express = require('express');
var router = express.Router();


var datiOspiti = new Array(8); // memorizza i valori dei campi form relativi agli ospiti
var pippo; // memorizza i dati relativi ai documenti dell'utente registrato
var prenEffettuata; // memorizza la prenotazione

var idUtente = "";
/*carica il middleware */

const { config } = require('../db/config');
const {makeDb, withTransaction } = require('../db/dbmiddleware');

// dichiaro multer per la foto del documento
var multer = require('multer');


var storage = multer.diskStorage({
    /* usiamo destination per deterimare in quale cartella salvare i file*/
    destination: function(req, file, cb){
        cb(null,'./public/images/uploads/') //./public/images/uploads/documentiPrenotazione/
    },
    /*filename determina il nome del file all'interno della cartella */
    filename: function(req, file, cb){
        file.originalname = file.originalname.slice(file.originalname.length-7,file.originalname.length);
        console.log('caricato '+ file.originalname)
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random()*1E9)
        cb(null, uniqueSuffix + '-' + file.originalname)
        console.log("il nome è: " + uniqueSuffix + '-' + file.originalname)
    }
})

var upload = multer ( { storage : storage });


//carico i moduli prenotazione ed Ospiti
var moduloPrenotazione = require('../public/javascripts/prenotazione(E).js');
var moduloOspite = require('../public/javascripts/DatiOspite.js');
var moduloDocUtente = require('../public/javascripts/DocUtenteR.js');

var datePren;


/* GET prenotazionePg1 */
router.get('/prenotazionePg1', async function(req, res, next) {
    prenEffettuata = new moduloPrenotazione();
    console.log(res.locals.date);
    datePren = res.locals.date;
    idAlloggio = res.locals.alloggio.ID_ALL;
    prezzoNotte = res.locals.alloggio.prezzo;
    prezzoTassa = res.locals.alloggio.tasse; // fare check per le tasse 
    console.log(idAlloggio);
    
    

    const db = await makeDb(config);
    try {
        await withTransaction(db, async() => {
            console.log(req.session.user);
            if(req.session.user == undefined) {
               
                console.log("metto true");
                req.app.locals.prenLogin = true;
            }else {
                var utente = req.app.locals.users.get(req.session.user.id_utente);
            }
            
            if( utente!= undefined) {
                idUtente = utente.id_utente;
                res.render('prenotazioneDir/prenotazionePg1',{data:datePren});
            }else {
                console.log('sessione Utente non trovata!');
                res.render('Autenticazione')
            }
            
        });
    } catch (err) {
        console.log(err);
        next(createError(500));
    } 
    
});

/* GET prenotazionePg2 */
router.get('/prenotazionePg2', async function(req, res, next) {
    pippo = new moduloDocUtente(); 
    datiOspiti[0]= new moduloOspite();
    datiOspiti[1]= new moduloOspite();
    datiOspiti[2]= new moduloOspite();
    datiOspiti[3]= new moduloOspite();
    datiOspiti[4]= new moduloOspite();
    datiOspiti[5]= new moduloOspite();
    datiOspiti[6]= new moduloOspite();
    datiOspiti[7]= new moduloOspite(); 
    
    res.render('prenotazioneDir/prenotazionePg2');
});

//POST prenotazionePg2
router.post('/prenotazionePg3', compilaPt1);

async function compilaPt1(req, res, next){
   try {
       pippo.tipo_doc = req.body.documentoU;
       pippo.num_doc = req.body.numeroDocU;
       pippo.scadenza_doc = req.body.scadenzaDocU;
       pippo.autorita_doc = req.body.autoritaDocumentoU;

       datiOspiti[0].nome = req.body.nome;
       datiOspiti[0].cognome = req.body.cognome;
       datiOspiti[0].nazionalita = req.body.nazione;
       datiOspiti[0].eta = req.body.eta_ospiti;
       datiOspiti[0].tipo_doc = req.body.documento1;
       datiOspiti[0].num_doc = req.body.numeroDoc1;
       datiOspiti[0].scadenza_doc = req.body.scadenzaDoc1;
       datiOspiti[0].autorita_doc = req.body.autoritaDocumento1;

       datiOspiti[1].nome = req.body.nome2;
       datiOspiti[1].cognome = req.body.cognome2;
       datiOspiti[1].nazionalita = req.body.nazione2;
       datiOspiti[1].eta = req.body.eta_ospiti2;
       datiOspiti[1].tipo_doc = req.body.documento2;
       datiOspiti[1].num_doc = req.body.numeroDoc2;
       datiOspiti[1].scadenza_doc = req.body.scadenzaDoc2;
       datiOspiti[1].autorita_doc = req.body.autoritaDocumento2;

       datiOspiti[2].nome = req.body.nome3;
       datiOspiti[2].cognome = req.body.cognome3;
       datiOspiti[2].nazionalita = req.body.nazione3;
       datiOspiti[2].eta = req.body.eta_ospiti3;
       datiOspiti[2].tipo_doc = req.body.documente3;
       datiOspiti[2].num_doc = req.body.numeroDoc3;
       datiOspiti[2].scadenza_doc = req.body.scadenzaDoc3;
       datiOspiti[2].autorita_doc = req.body.autoritaDocumento3;

       datiOspiti[3].nome = req.body.nome4;
       datiOspiti[3].cognome = req.body.cognome4;
       datiOspiti[3].nazionalita = req.body.nazione4;
       datiOspiti[3].eta = req.body.eta_ospiti4;
       datiOspiti[3].tipo_doc = req.body.documento4;
       datiOspiti[3].num_doc = req.body.numeroDoc4;
       datiOspiti[3].scadenza_doc = req.body.scadenzaDoc4;
       datiOspiti[3].autorita_doc = req.body.autoritaDocumento4;

       datiOspiti[4].nome = req.body.nome5;
       datiOspiti[4].cognome = req.body.cognome5;
       datiOspiti[4].nazionalita = req.body.nazione5;
       datiOspiti[4].eta = req.body.eta_ospiti5;
       datiOspiti[4].tipo_doc = req.body.documento5;
       datiOspiti[4].num_doc = req.body.numeroDoc5;
       datiOspiti[4].scadenza_doc = req.body.scadenzaDoc5;
       datiOspiti[4].autorita_doc = req.body.autoritaDocumento5;

       datiOspiti[5].nome = req.body.nome6;
       datiOspiti[5].cognome = req.body.cognome6;
       datiOspiti[5].nazionalita = req.body.nazione6;
       datiOspiti[5].eta = req.body.eta_ospiti6;
       datiOspiti[5].tipo_doc = req.body.documento6;
       datiOspiti[5].num_doc = req.body.numeroDoc6;
       datiOspiti[5].scadenza_doc = req.body.scadenzaDoc6;
       datiOspiti[5].autorita_doc = req.body.autoritaDocumento6;

       datiOspiti[6].nome = req.body.nome7;
       datiOspiti[6].cognome = req.body.cognome7;
       datiOspiti[6].nazionalita = req.body.nazione7;
       datiOspiti[6].eta = req.body.eta_ospiti7;
       datiOspiti[6].tipo_doc = req.body.documento7;
       datiOspiti[6].num_doc = req.body.numeroDoc7;
       datiOspiti[6].scadenza_doc = req.body.scadenzaDoc7;
       datiOspiti[6].autorita_doc = req.body.autoritaDocumento7;

       datiOspiti[7].nome = req.body.nome8;
       datiOspiti[7].cognome = req.body.cognome8;
       datiOspiti[7].nazionalita = req.body.nazione8;
       datiOspiti[7].eta = req.body.eta_ospiti8;
       datiOspiti[7].tipo_doc = req.body.documento8;
       datiOspiti[7].num_doc = req.body.numeroDoc8;
       datiOspiti[7].scadenza_doc = req.body.scadenzaDoc8;
       datiOspiti[7].autorita_doc = req.body.autoritaDocumento8;

       console.log('Inserimento valori step 1');
       console.log('');
       console.log(pippo);
       console.log('');
       for (let index = 0; index < 8; index++) {
            console.log(datiOspiti[index]);           
       }
       
       res.render('prenotazioneDir/prenotazionePg3');

   } catch (err) {
       console.log(err);
       next(createError(500));
   }
    
}

//POST prenotazionePg3
var cpUpload = upload.fields( [{name: 'fileDocU', maxCount: 2 },{name: 'fileDoc1', maxCount: 2 },{name: 'fileDoc2', maxCount: 2 },{name: 'fileDoc3', maxCount: 2 },{name: 'fileDoc4', maxCount: 2 },{name: 'fileDoc5', maxCount: 2 },{name: 'fileDoc6', maxCount: 2 },{name: 'fileDoc7', maxCount: 2 },{name: 'fileDoc8', maxCount: 2 }])
router.post('/upload', cpUpload, async function (req, res, next) {

    try {
      pippo.foto_doc = req.files['fileDocU'][0].filename;
      datiOspiti[0].foto_doc = req.files['fileDoc1'];
      datiOspiti[1].foto_doc = req.files['fileDoc2']; 
      datiOspiti[2].foto_doc = req.files['fileDoc3'];   
      datiOspiti[3].foto_doc = req.files['fileDoc4']; 
      datiOspiti[4].foto_doc = req.files['fileDoc5']; 
      datiOspiti[5].foto_doc = req.files['fileDoc6']; 
      datiOspiti[6].foto_doc = req.files['fileDoc7']; 
      datiOspiti[7].foto_doc = req.files['fileDoc8'];
      for (let index = 0; index < 8; index++) {
          if(datiOspiti[index].foto_doc == undefined){
              datiOspiti[index].foto_doc = null;
          }else{
            datiOspiti[index].foto_doc = datiOspiti[index].foto_doc[0].filename;
          }
      }
      
      console.log('step 2 valori inseriti');

      res.render('prenotazioneDir/prenotazionePg4');

    } catch (error) {
        console.log(error);
        next(createError(500));
    }
    
});  




//POST prenotazionePg4
router.post('/prenotazionePg5', compilaPt3);

async function compilaPt3(req, res, next){

    try {
        // calcolo le notti per determinare il prezzo totale
        d_i = new Date(datePren.data_i);
        d_f = new Date(datePren.data_f);
        var notti = Math.floor((d_f - d_i)/86400000);
        prenEffettuata.utente = req.session.user.id_utente;
        prenEffettuata.alloggio = idAlloggio;
        prenEffettuata.data_inizio = datePren.data_i;
        prenEffettuata.data_fine = datePren.data_f;
        prenEffettuata.data_pren = new Date();
        prenEffettuata.prezzo_totale = (prezzoNotte * notti);
        prenEffettuata.stato_prenotazione = "richiesta";
        prenEffettuata.tipo_pagamento = req.body.metodoPagamento;   
         
        console.log(prenEffettuata);
        const db = await makeDb(config); 
        var results = {};

        await withTransaction(db, async() => {
            // inserimento prenotazione
            let sql = "INSERT INTO Prenotazione VALUES (UUID(),?,?,?,?,?,?,?,?);" ;
                      // INSERT INTO DatiOspiti VALUES (UUID(),?,?,?,?,?,?,?,?,?); ";
            let values = [
                //creazione query prenotazione
                prenEffettuata.utente,
                prenEffettuata.alloggio,
                prenEffettuata.data_inizio,
                prenEffettuata.data_fine,
                prenEffettuata.data_pren,
                prenEffettuata.prezzo_totale,
                prenEffettuata.stato_prenotazione,
                prenEffettuata.tipo_pagamento
                
                //creazione query datiOspiti
            ];
      
            results = await db.query(sql, values)
                    .catch(err => {
                        throw err;
                    });
                console.log("Prenotazione Effettuata con successo");
          });

        res.render('prenotazioneDir/prenotazionePg5');  
    } catch (err) {
        console.log(err);
        next(createError(500));
    }
}

/* GET recapPrenotazione */
router.get('/recapPrenotazione', function(req, res, next) {
    res.render('prenotazioneDir/recapPrenotazione');
});

module.exports = router;