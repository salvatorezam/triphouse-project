var createError = require('http-errors');
var express = require('express');
var router = express.Router();
var datiOspiti = new Array(8);
var pippo;


var idUtente ="" //sessione se non sbaglio

/*carica il middleware */
const { config } = require('../db/config');
const {makeDb, withTransection } = require('../db/dbmiddleware');

/*carica il multer, è un middleware per la gestione
 dei multipart/form-data, ossia per la gestione dei
 file caricati*/
var multer = require('multer');

const storage = multer.diskStorage({
    /* usiamo destination per deterimare in quale cartella salvare i file*/
    destination: function(req, file, cb){
        cb(null,'./public/images/uploads/documentiPrenotazione/')
    },
    /*filename determina il nome del file all'interno della cartella */
    filename: function(req, file, cb){
        console.log('caricato '+ file.originalname)
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random()*1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname)
        console.log("il nome è: " + file.originalname)
    }
})

var upload = multer({ storage: storage}).array('docPrenotazione',2);

//carico i moduli prenotazione ed Ospiti
var moduloPrenotazione = require('../public/javascripts/prenotazione(E).js');
var moduloOspite = require('../public/javascripts/DatiOspite.js');
var moduloDocUtente = require('../public/javascripts/DocUtenteR.js');

/* GET prenotazionePg1 */
router.get('/prenotazionePg1', function(req, res, next) {
    res.render('prenotazioneDir/prenotazionePg1');
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
    //const db = await makeDb(config);

    /*try{
        await withTransection(db, async()=>{

            let sql0 = "SELECT * FROM_SESSIONS WHERE session_id = ?;";
            results = await db.query(sql0, [req.session.id])
                .catch(err => {
                    throw err;
                });
            if (results.affectedRows == 0) {
                console.log('sessione utente non trovata!');
                next(createError(404, 'Sessione utente non trovata'));
            } else {
                let datiUtente = JSON.parse(results[0].data);
                idUtente = datiUtente.user.id_utente;
            }
                
        });
    } catch(err){
        console.log(err);
        next(createError(500));
    } */
    res.render('prenotazioneDir/prenotazionePg2');
});

//POST prenotazionePg2
router.post('/prenotazionePg3', compilaPt1);

async function compilaPt1(req, res, next){
   try {
       datiOspiti[0].nome = req.body.nome;
       datiOspiti[0].cognome = req.body.cognome;
       datiOspiti[0].nazionalita = req.body.nazione;
       datiOspiti[0].eta = req.body.eta_ospiti;

       datiOspiti[1].nome = req.body.nome2;
       datiOspiti[1].cognome = req.body.cognome2;
       datiOspiti[1].nazionalita = req.body.nazione2;
       datiOspiti[1].eta = req.body.eta_ospiti2;

       datiOspiti[2].nome = req.body.nome3;
       datiOspiti[2].cognome = req.body.cognome3;
       datiOspiti[2].nazionalita = req.body.nazione3;
       datiOspiti[2].eta = req.body.eta_ospiti3;

       datiOspiti[3].nome = req.body.nome4;
       datiOspiti[3].cognome = req.body.cognome4;
       datiOspiti[3].nazionalita = req.body.nazione4;
       datiOspiti[3].eta = req.body.eta_ospiti4;

       datiOspiti[4].nome = req.body.nome5;
       datiOspiti[4].cognome = req.body.cognome5;
       datiOspiti[4].nazionalita = req.body.nazione5;
       datiOspiti[4].eta = req.body.eta_ospiti5;

       datiOspiti[5].nome = req.body.nome6;
       datiOspiti[5].cognome = req.body.cognome6;
       datiOspiti[5].nazionalita = req.body.nazione6;
       datiOspiti[5].eta = req.body.eta_ospiti6;

       datiOspiti[6].nome = req.body.nome7;
       datiOspiti[6].cognome = req.body.cognome7;
       datiOspiti[6].nazionalita = req.body.nazione7;
       datiOspiti[6].eta = req.body.eta_ospiti7;

       datiOspiti[7].nome = req.body.nome8;
       datiOspiti[7].cognome = req.body.cognome8;
       datiOspiti[7].nazionalita = req.body.nazione8;
       datiOspiti[7].eta = req.body.eta_ospiti8;

       console.log('Inserimento valori step 1');
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
router.post('/prenotazionePg4', compilaPt2);

async function compilaPt2(req, res, next){
    
   try { 

       pippo.tipo_doc = req.body.documentoU;
       pippo.num_doc = req.body.numeroDocU;
       pippo.scadenza_doc = req.body.scadenzaDocU;
       pippo.autorita_doc = req.body.autoritaDocumentoU;

       datiOspiti[0].tipo_doc = req.body.documento1;
       datiOspiti[0].num_doc = req.body.numeroDoc1;
       datiOspiti[0].scadenza_doc = req.body.scadenzaDoc1;
       datiOspiti[0].autorita_doc = req.body.autoritaDocumento1;

       datiOspiti[1].tipo_doc = req.body.documento2;
       datiOspiti[1].num_doc = req.body.numeroDoc2;
       datiOspiti[1].scadenza_doc = req.body.scadenzaDoc2;
       datiOspiti[1].autorita_doc = req.body.autoritaDocumento2;

       datiOspiti[2].tipo_doc = req.body.documente3;
       datiOspiti[2].num_doc = req.body.numeroDoc3;
       datiOspiti[2].scadenza_doc = req.body.scadenzaDoc3;
       datiOspiti[2].autorita_doc = req.body.autoritaDocumento3;

       datiOspiti[3].tipo_doc = req.body.documento4;
       datiOspiti[3].num_doc = req.body.numeroDoc4;
       datiOspiti[3].scadenza_doc = req.body.scadenzaDoc4;
       datiOspiti[3].autorita_doc = req.body.autoritaDocumento4;

       datiOspiti[4].tipo_doc = req.body.documento5;
       datiOspiti[4].num_doc = req.body.numeroDoc5;
       datiOspiti[4].scadenza_doc = req.body.scadenzaDoc5;
       datiOspiti[4].autorita_doc = req.body.autoritaDocumento5;

       datiOspiti[5].tipo_doc = req.body.documento6;
       datiOspiti[5].num_doc = req.body.numeroDoc6;
       datiOspiti[5].scadenza_doc = req.body.scadenzaDoc6;
       datiOspiti[5].autorita_doc = req.body.autoritaDocumento6;

       datiOspiti[6].tipo_doc = req.body.documento7;
       datiOspiti[6].num_doc = req.body.numeroDoc7;
       datiOspiti[6].scadenza_doc = req.body.scadenzaDoc7;
       datiOspiti[6].autorita_doc = req.body.autoritaDocumento7;

       datiOspiti[7].tipo_doc = req.body.documento8;
       datiOspiti[7].num_doc = req.body.numeroDoc8;
       datiOspiti[7].scadenza_doc = req.body.scadenzaDoc8;
       datiOspiti[7].autorita_doc = req.body.autoritaDocumento8;

       console.log('Inserimento valori step 2');
       console.log(pippo);
       for (let index = 0; index < 8; index++) {
            console.log(datiOspiti[index]);           
       }
       
       res.render('prenotazioneDir/prenotazionePg4');

   } catch (err) {
       console.log(err);
       next(createError(500));
   }
    
}

/* GET prenotazionePg3 */
/*router.get('/prenotazionePg3', function(req, res, next) {
    res.render('prenotazioneDir/prenotazionePg3');
}); */

/* GET prenotazionePg4 
router.get('/prenotazionePg4', function(req, res, next) {
    //this.prenotazione = new moduloPrenotazione();
    res.render('prenotazioneDir/prenotazionePg4');
}); */

/* GET prenotazionePg5 */
router.get('/prenotazionePg5', function(req, res, next) {
    res.render('prenotazioneDir/prenotazionePg5');
});

/* GET recapPrenotazione */
router.get('/recapPrenotazione', function(req, res, next) {
    res.render('prenotazioneDir/recapPrenotazione');
});



module.exports = router;