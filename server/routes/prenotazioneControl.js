var createError = require('http-errors');
var express = require('express');
var router = express.Router();


var datiOspiti; // memorizza i valori dei campi form relativi agli ospiti
var datiUtenteR; // memorizza i dati relativi ai documenti dell'utente registrato
var prenEffettuata; // memorizza la prenotazione
var data_prenotazione_effettuata;



var idUtente = "";
/*carica il middleware */

const { config } = require('../db/config');
const {makeDb, withTransaction } = require('../db/dbmiddleware');

// dichiaro multer per la foto del documento
var multer = require('multer');


var storage = multer.diskStorage({
    /* usiamo destination per deterimare in quale cartella salvare i file*/
    destination: function(req, file, cb){
        cb(null,'./public/images/uploads/documentiPrenotazione') //./public/images/uploads/documentiPrenotazione/
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

var datePren;
var d_i;
var d_f ;
var numOspit;
var notti;
var totale;
var nomeUtenteSessione;

//CALCOLO GIORNO ANNO

function calcolaGiorno(value){

    //var now = new Date();
    var start = new Date(value.getFullYear(), 0, 0);

    var diff = (value - start) + ((start.getTimezoneOffset() - value.getTimezoneOffset()) * 60 * 1000);
    var oneDay = 1000 * 60 * 60 * 24;
    var day = Math.floor(diff / oneDay);

    return day;
}
var arrDoc = [];

/* GET prenotazionePg1 */
router.get('/prenotazionePg1', async function(req, res, next) {
    prenEffettuata = new moduloPrenotazione();
    console.log(res.locals.date);
    datePren = res.locals.date;
    numOspit = res.locals.date.data_n_o;
    numOspit = numOspit - 1;
    idAlloggio = res.locals.alloggio.ID_ALL;
    prezzoNotte = res.locals.alloggio.prezzo;
    prezzoTassa = res.locals.alloggio.tasse;
    data_prenotazione_effettuata = new Date();

    arrDoc.push({name: 'fronteUtente', maxCount: 1});
    arrDoc.push({name: 'retroUtente', maxCount:1});
    for (let x = 1; x <= numOspit; x++) {

        let f = 'fronteDocOsp' + x;
        let r = 'retroDocOsp' + x;

        arrDoc.push({name: f, maxCount:1});
        arrDoc.push({name: r, maxCount:1});
    }

    
    
    // calcolo le notti per determinare il prezzo totale
    d_i = new Date(datePren.data_i);
    d_f = new Date(datePren.data_f);    
    notti = Math.floor((d_f - d_i)/86400000);
    d_i = new Date(datePren.data_i).toLocaleDateString();
    d_f = new Date(datePren.data_f).toLocaleDateString(); 
    // calcolo il totale 
    
    if(notti >= 3 ){
        totale = ((prezzoNotte*notti)+(prezzoTassa*3));
    }else{
        totale = ((prezzoNotte*notti)+(prezzoTassa*notti));
    } 

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

                //EFFETTUO QUERY PER IL CONTROLLO DEI 28 GIORNI
                let sql = "SELECT* FROM prenotazione WHERE utente = ? AND alloggio = ?;";
                let values = [
                    
                    idUtente,
                    idAlloggio
                ];
        
                results = await db.query(sql, values)
                        .catch(err => {
                            throw err;
                        });
        
                //CALCOLO DEI 28 GIORNI

                let prenotazioni_anno_cercato = [];
                let anno_prenotazione = new Date(datePren.data_i); //trovo l'anno della data di inzio della mia prenotazione
                    anno_prenotazione = anno_prenotazione.getFullYear();

                if(results.length != 0){

                    let count = 0;

                    results.forEach(element => {

                        if(element.data_inizio.getFullYear() == anno_prenotazione){  //controllo se ho effettuato altre prenotazioni in quell'anno

                            prenotazioni_anno_cercato[count] = element;
                            count++;
                        }
                    });

                }

                let countGiorni = notti;  //inizializzo count giorni con il numero di giorni che l'utente ha selezionato per effettuare la prenotazione

                prenotazioni_anno_cercato.forEach(element => {

                    let i = calcolaGiorno(element.data_inizio);
                    let f = calcolaGiorno(element.data_fine);

                    countGiorni = countGiorni + (f - i);
                    
                });

                //CONTROLLO DEI 28 GIORNI 

                if(countGiorni > 28){

                    res.send('PRENOTAZIONE-NON-DISPONIBILE-SUPERI-I-28-GIORNI-DISPONIBILI');
                }
                else{

                    res.render('prenotazioneDir/prenotazionePg1',{data:datePren,dataPrezzoNotte:prezzoNotte,dataPrezzoTassa:prezzoTassa,dataNotti:notti,dataTotale:totale,dataNumOsp:numOspit});
                }


            }
            else {
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
    datiUtenteR = new moduloOspite(); 
    datiOspiti = new Array(numOspit+1); 
    
    res.render('prenotazioneDir/prenotazionePg2',{data:datePren,dataPrezzoNotte:prezzoNotte,dataPrezzoTassa:prezzoTassa,dataNotti:notti,dataTotale:totale,dataNumOsp:numOspit});
});

//POST prenotazionePg2
router.post('/prenotazionePg3', compilaPt1);

async function compilaPt1(req, res, next){
   try {
        
        datiUtenteR.tipo_doc = req.body.documentoU;
        datiUtenteR.num_doc = req.body.numeroDocU;
        datiUtenteR.scadenza_doc = req.body.scadenzaDocU;

        for (let x = 1; x <= numOspit; x++) {

            datiOspiti[x] = {};
            datiOspiti[x].nome = req.body['nome' + x];
            datiOspiti[x].cognome = req.body['cognome' + x];
            datiOspiti[x].nazionalita = req.body['nazione' + x];
            datiOspiti[x].eta = req.body['eta_ospite' + x];
            datiOspiti[x].num_doc = req.body['numDoc' + x];
            datiOspiti[x].scadenza_doc = req.body['dataScad' + x];
            datiOspiti[x].tipo_doc = req.body['tipoDoc' + x];
        }


       console.log('Inserimento valori step 1');
       console.log(datiOspiti);
        
       let invioDoc = "";
       if (datiOspiti[1].num_doc == null) {

            invioDoc = "disabled";
       }
       
       res.render('prenotazioneDir/prenotazionePg3',{data:datePren,dataPrezzoNotte:prezzoNotte,dataPrezzoTassa:prezzoTassa,dataNotti:notti,dataTotale:totale,dataNumOsp:numOspit,dataBut:invioDoc});

   } catch (err) {
       console.log(err);
       next(createError(500));
   }
    
}

//POST prenotazionePg3
var cpUpload = upload.fields(arrDoc);
router.post('/upload', cpUpload, async function (req, res, next) {

    try {
      //assegno l'oggetto file alla proprietà foto_doc dell'oggetto datiOspite   
      datiUtenteR.foto_fronte_doc = req.files['fronteUtente'][0].filename;
      datiUtenteR.foto_retro_doc = req.files['retroUtente'][0].filename;

      for (let x = 1; x <= numOspit; x++) {

        if (req.files['fronteDocOsp' + x] != undefined) {
            datiOspiti[x].foto_fronte_doc = req.files['fronteDocOsp' + x][0].filename;
            datiOspiti[x].foto_retro_doc = req.files['retroDocOsp' + x][0].filename;
            console.log('il nome salvato dei doc: ' + datiOspiti[x].foto_fronte_doc);
        }
      }

      console.log('step 2 valori inseriti:');
      console.log(datiUtenteR);
      console.log('dati ospiti');
      console.log(datiOspiti[1]);
      console.log(datiOspiti[2]);

      res.render('prenotazioneDir/prenotazionePg4',{data:datePren,dataPrezzoNotte:prezzoNotte,dataPrezzoTassa:prezzoTassa,dataNotti:notti,dataTotale:totale,dataNumOsp:numOspit});

    } catch (error) {
        console.log(error);
        next(createError(500));
    }
    
});  



//POST prenotazionePg4
router.post('/prenotazionePg5', compilaPt3);

async function compilaPt3(req, res, next){

    try {
        nomeUtenteSessione=req.session.user.nome; // passo il nome utente alla finestra pg5
        prenEffettuata.utente = req.session.user.id_utente;
        prenEffettuata.alloggio = idAlloggio;
        prenEffettuata.data_inizio = datePren.data_i;
        prenEffettuata.data_fine = datePren.data_f;
        prenEffettuata.data_pren = data_prenotazione_effettuata;
        prenEffettuata.prezzo_totale = (prezzoNotte * notti);
        prenEffettuata.stato_prenotazione = "richiesta";
        prenEffettuata.tipo_pagamento = req.body.metodoPagamento;   
         
        console.log(prenEffettuata);
        const db = await makeDb(config);
        var results = {};

        await withTransaction(db, async() => {
            // inserimento prenotazione
            let sql = "INSERT INTO Prenotazione VALUES (UUID(),?,?,?,?,?,?,?,?,?); \
                        INSERT INTO DocumentiUtenteR VALUES (UUID(),?,?,?,?,?,?,(SELECT ID_PREN FROM PRENOTAZIONE WHERE utente = ? AND alloggio = ?)); \
                        INSERT INTO DateIndisponibili VALUES (UUID(),?,?,?);";
            let values = [
                prenEffettuata.utente,
                prenEffettuata.alloggio,
                prenEffettuata.data_inizio,
                prenEffettuata.data_fine,
                prenEffettuata.data_pren,
                prenEffettuata.prezzo_totale,
                prenEffettuata.stato_prenotazione,
                prenEffettuata.tipo_pagamento,
                prenEffettuata.tasse_pagate = null,
                datiUtenteR.tipo_doc,
                datiUtenteR.num_doc,
                datiUtenteR.scadenza_doc,
                datiUtenteR.foto_fronte_doc,
                datiUtenteR.foto_retro_doc,
                prenEffettuata.utente,
                prenEffettuata.utente,
                prenEffettuata.alloggio,
                //prenEffettuata.data_pren,
                prenEffettuata.data_inizio,
                prenEffettuata.data_fine,
                prenEffettuata.alloggio
            ];
      
            results = await db.query(sql, values)
                    .catch(err => {
                        throw err;
                    });

            console.log("Prenotazione Effettuata con successo");
            
            var nosql = false;
            var sql_tipo = "INSERT INTO DatiOspiti VALUES (UUID(),?,?,?,?,?,?,?,?,?,(SELECT ID_PREN FROM PRENOTAZIONE WHERE utente = ? AND alloggio = ?));";
            var sql1 = "";
            var values1 = [];

            if (datiOspiti[1] == undefined || datiOspiti[1].num_doc == '' || datiOspiti[1].num_doc == null ) {
                nosql = true;
                //se l' utente non setta il numero di documento, mi scrive informazioni che comunque l' host
                //dovrà riprendere in loco per forza di cose, quindi tanto vale non fare la insert nel db
            }
            else {
                for (let x = 1; x <= numOspit; x++) {
                    if(datiOspiti[x] != undefined) {
                       sql1 = sql1 + sql_tipo;
                       values1.push(datiOspiti[x].nome);
                       values1.push(datiOspiti[x].cognome);
                       values1.push(datiOspiti[x].tipo_doc);
                       values1.push(datiOspiti[x].num_doc);
                       values1.push(datiOspiti[x].foto_fronte_doc);
                       values1.push(datiOspiti[x].foto_retro_doc);
                       values1.push(datiOspiti[x].nazionalita);
                       values1.push(datiOspiti[x].scadenza_doc);
                       values1.push(datiOspiti[x].eta);
                       values1.push(prenEffettuata.utente);
                       values1.push(prenEffettuata.alloggio);
                       //values1.push(prenEffettuata.data_pren);
                    }
                }
            }
            
            if (nosql == false) {
                results1 = await db.query(sql1, values1)
                        .catch(err => {
                            throw err;
                        });
            }
            console.log("Documenti inviati");
        });
        
        res.render('prenotazioneDir/prenotazionePg5',{nomeUtSes:nomeUtenteSessione});

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