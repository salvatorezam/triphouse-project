var createError = require('http-errors');
var express = require('express');
var router = express.Router();



var multer  = require('multer');


const storage = multer.diskStorage({
  destination: function(req, file, cb){             //destination viene utilizzato per determinare in quale cartella devono essere archiviati i file caricati.
    cb(null, './uploads/')
  },
  filename: function(req, file, cb){                //filenameviene utilizzato per determinare il nome del file all'interno della cartella
    console.log('uploaded' + file.originalname)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname)
    //fileName = file.originalname
    console.log("il nome è: "+ file.originalname)
  }
});

var upload = multer({ storage: storage }).array('fileToUpload',6);




//const upload = multer({storage: storage}).single('fileToUpload'); //req.files is array og fileTuUpload files

/*carichiamo il middleware*/

const { config } = require('../db/config');
const { makeDb, withTransaction } = require('../db/dbmiddleware');

var moduloAlloggio = require('../public/javascripts/Alloggio.js');

/* GET agg-all-1 */
router.get('/agg-all-1', function(req, res, next) {

    this.alloggio = new moduloAlloggio();
   /* for(var x=0; x<6; x++){
      this.alloggio.foto[x] = null;
      if(this.alloggio.foto[x]==null){
        console.log("funziona");
      };
    }*/
    

    res.render('aggiungiAlloggioDir/agg-all-1');
  });
  
/* GET agg-all-2 */
router.get('/agg-all-2', function(req, res, next) {
res.render('aggiungiAlloggioDir/agg-all-2');
});

/* GET agg-all-3 */
router.get('/agg-all-3', function(req, res, next) {
res.render('aggiungiAlloggioDir/agg-all-3');
});

/* GET agg-all-4 */
router.get('/agg-all-4', function(req, res, next) {
res.render('aggiungiAlloggioDir/agg-all-4');
});

/* GET agg-all-5 */
router.get('/agg-all-5', function(req, res, next) {
res.render('aggiungiAlloggioDir/agg-all-5');
});

/* POST agg-all-1*/

router.post('/agg-all-2', compilaStep1);

async function compilaStep1(req, res, next){

  try {

    this.alloggio.tipo_all = req.body.tipo_all;
    this.alloggio.nome_proprietario = req.body.nome_proprietario;

    let v = req.body.indirizzo.split(',');

    this.alloggio.indirizzo = v[0].trim();
    this.alloggio.n_civico = v[1].trim();

    this.alloggio.citta = req.body.citta;
    this.alloggio.regione = req.body.regione;
    this.alloggio.provincia = req.body.provincia;
    this.alloggio.cap = req.body.cap;

    this.alloggio.num_ospiti = req.body.num_ospiti;
    this.alloggio.distanza_centro = req.body.distanza_centro;

    console.log('Inserimento valori step 1');
    console.log(this.alloggio);
    res.render('aggiungiAlloggioDir/agg-all-2');
    
  } catch (err) {
    console.log(err);
    next(createError(500));
  }
}

/* POST agg-all-2*/

router.post('/agg-all-3', compilaStep2);

async function compilaStep2(req, res, next){

  try {

    this.alloggio.num_letti_singoli = req.body.num_letti_singoli;
    this.alloggio.num_letti_matrimoniali = req.body.num_letti_matrimoniali;
    this.alloggio.num_camere = req.body.num_camere;
    this.alloggio.num_bagni = req.body.num_bagni;


    this.alloggio.cucina = req.body.servizi_0;
    this.alloggio.lavanderia = req.body.servizi_1;
    this.alloggio.aria_condizionata = req.body.servizi_2;
    this.alloggio.wifi = req.body.servizi_3;
    this.alloggio.colazione = req.body.servizi_4;
    this.alloggio.asciugacapelli = req.body.servizi_5;
    this.alloggio.tv = req.body.servizi_6;

    this.alloggio.carta_igienica = req.body.servizi2_0;
    this.alloggio.sapone_mani_corpo = req.body.servizi2_1;
    this.alloggio.asciugamano = req.body.servizi2_2;
    this.alloggio.accappatoio = req.body.servizi2_3;
    this.alloggio.cuscino = req.body.servizi2_4;
    this.alloggio.lenzuola = req.body.servizi2_5;

    console.log('Inserimento valori step 2');
    console.log(this.alloggio);
    res.render('aggiungiAlloggioDir/agg-all-3');
    
  } catch (error) {
    console.log(err);
    next(createError(500));
  }
}

/* POST agg-all-3*/

router.post('/agg-all-4', compilaStep3);

async function compilaStep3(req, res, next){

  try {

    this.alloggio.titolo = req.body.titolo_annuncio;
    this.alloggio.descrizione_alloggio = req.body.descrizione;
    this.alloggio.descrizione_regole = req.body.descrizione_regole;
    this.alloggio.note = req.body.descrizione_note;
    this.alloggio.tasse = req.body.tassa;
    this.alloggio.prezzo = req.body.prezzo;

    console.log('Inserimento valori step 3');
    console.log(this.alloggio);
    res.render('aggiungiAlloggioDir/agg-all-4');
    
  } catch (error) {
    console.log(err);
    next(createError(500));
  }
}

/* POST agg-all-4*/

router.post('/upload', upload, function (req, res, next) {
  // req.files is array of `photos` files
  // req.body will contain the text fields, if there were any
  //if(err) return console.error(err)

  try {
    this.alloggio.foto = req.files;
    console.log(req.files);
    console.log(this.alloggio);
    res.render('aggiungiAlloggioDir/agg-all-5');

  } catch(error){
    console.log(err);
    next(createError(500));
  }
});












//router.post('/upload', (req, res) =>{
 // for(var x=0; x<6; x++){
 //   if(this.alloggio.foto[x] == null){
 //     upload(req, res, err => {
  //      if(err) return console.error(err)
  //      console.log(req.file)
  //      res.render('aggiungiAlloggioDir/agg-all-4')
  //    });
  //    this.alloggio.foto[x] = fileName;
  //    console.log("nome file salvato: " + this.alloggio.foto[x]);
  //    break;
  // }
  //  else{
  //    alert("Non puoi caricare più di 6 foto");
  //    break;
  //  }
 // }
//});

/*Router Post*/

router.post('/alloggioInserito', inserisciAlloggio);

/*middleware di inserisci alloggio*/

async function inserisciAlloggio(req,res,next){

  /*istanziamo il middleware*/
/*
  const db = await makeDb(config);
    let results = {};

    try {

      await withTransaction(db, async() => {
          // inserimento utente
          let sql = "INSERT INTO Alloggio VALUES (UUID(),?,?,?,?,?,?,?);";
          let values = [
              req.body.tipo_all,
              req.body.nome_proprietario,
              req.body.indirizzo,
              req.body.cap,
              req.body.regione,
              req.body.citta,
              req.body.provincia
          ];
              results = await db.query(sql, values)
              .catch(err => {
                  throw err;
              });
           
          console.log('Inserimento tabella alloggio');
          console.log(results);
          res.render('aggiungiAlloggioDir/agg-all-2');
      });
  } catch (err) {
      console.log(err);
      next(createError(500));
  }*/
}







module.exports = router;