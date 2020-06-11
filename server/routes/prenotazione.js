var createError = require('http-errors');
var express = require('express');
var router = express.Router();
var datiOspiti = new Array(8);

/*carica il middleware */
const { config } = require('../db/config');
const {makeDb, withTransection } = require('../db/dbmiddleware');

/*carica il multer, è un middleware per la gestione
 dei multipart/form-data, ossia per la gestione dei
 file caricati*/
var multer = require('multer');

var storage = multer.diskStorage({
    /* usiamo destination per deterimare in quale cartella salvare i file*/
    destination: function(req, file, cb){
        cb(null,'./uploads/documentiPrenotazione')
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


/* GET prenotazionePg1 */
router.get('/prenotazionePg1', function(req, res, next) {
    res.render('prenotazioneDir/prenotazionePg1');
});

/* GET prenotazionePg2 */
router.get('/prenotazionePg2', function(req, res, next) {
    
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

/* GET prenotazionePg3 */
/*router.get('/prenotazionePg3', function(req, res, next) {
    res.render('prenotazioneDir/prenotazionePg3');
}); */

/* GET prenotazionePg4 */
router.get('/prenotazionePg4', function(req, res, next) {
    //this.prenotazione = new moduloPrenotazione();
    res.render('prenotazioneDir/prenotazionePg4');
});
/* GET prenotazionePg5 */
router.get('/prenotazionePg5', function(req, res, next) {
    res.render('prenotazioneDir/prenotazionePg5');
});

/* GET recapPrenotazione */
router.get('/recapPrenotazione', function(req, res, next) {
    res.render('prenotazioneDir/recapPrenotazione');
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
        console.log(datiOspiti[0]);
        res.render('prenotazioneDir/prenotazionePg3');

    } catch (err) {
        console.log(err);
        next(createError(500));
    }
     
 }

module.exports = router;