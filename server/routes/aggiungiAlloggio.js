var createError = require('http-errors');
var express = require('express');
var router = express.Router();

var idUtente = "";

/*carichiamo il middleware*/

const { config } = require('../db/config');
const { makeDb, withTransaction } = require('../db/dbmiddleware');

//DICHIARO MULTER PER FOTO

var multer  = require('multer');

const storage = multer.diskStorage({
  destination: function(req, file, cb){             //destination viene utilizzato per determinare in quale cartella devono essere archiviati i file caricati.
    cb(null, './public/images/uploads/')
  },
  filename: function(req, file, cb){                //filenameviene utilizzato per determinare il nome del file all'interno della cartella
    console.log('uploaded' + file.originalname)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + '-' + file.originalname.slice(file.originalname.length-7,file.originalname.length))
    //fileName = file.originalname
    console.log("il nome è: "+ file.originalname)
  }
});

var upload = multer({ storage: storage }).array('fileToUpload',6);  

//Carico il modulo alloggio per poter salvare i dati mano a mamo che si compila il form
//in modo che i dati verranno inviati al db solo alla fine della compilazione del form

var moduloAlloggio = require('../public/javascripts/Alloggio.js');

/* GET agg-all-1 */
router.get('/agg-all-1', async function(req, res, next) {

  this.alloggio = new moduloAlloggio();
  const db = await makeDb(config);

  try {
    await withTransaction(db, async() => {

      let utente = req.app.locals.users.get(req.session.user.id_utente);

        if (utente) {
        idUtente = utente.id_utente;
        }
        else {
        console.log('Sessione Utente non trovata!');
        next(createError(404, 'Sessione Utente non trovata'));
        }

      res.render('aggiungiAlloggioDir/agg-all-1');

  });

  } catch (err) {
      console.log(err);
      next(createError(500));
  }
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


    this.alloggio.cucina = (req.body.servizi_0 == 'true' ? true : false);
    this.alloggio.lavanderia = (req.body.servizi_1  == 'true' ? true : false);
    this.alloggio.aria_condizionata = (req.body.servizi_2  == 'true' ? true : false);
    this.alloggio.wifi =( req.body.servizi_3  == 'true' ? true : false);
    this.alloggio.colazione = (req.body.servizi_4  == 'true' ? true : false);
    this.alloggio.asciugacapelli = (req.body.servizi_5  == 'true' ? true : false);
    this.alloggio.tv = (req.body.servizi_6  == 'true' ? true : false);

    this.alloggio.carta_igienica = (req.body.servizi2_0  == 'true' ? true : false);
    this.alloggio.sapone_mani_corpo = (req.body.servizi2_1  == 'true' ? true : false);
    this.alloggio.asciugamano = (req.body.servizi2_2  == 'true' ? true : false);
    this.alloggio.accappatoio = (req.body.servizi2_3  == 'true' ? true : false);
    this.alloggio.cuscino = (req.body.servizi2_4  == 'true' ? true : false);
    this.alloggio.lenzuola = (req.body.servizi2_5  == 'true' ? true : false);

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

router.post('/upload', upload, async function (req, res, next) {
  // req.files is array of `photos` files
  // req.body will contain the text fields, if there were any
  //if(err) return console.error(err)

  try {

    this.alloggio.foto = req.files;   //assegno array di oggetti req.files a alloggio.foto
    //console.log(req.files.filename);
    //console.log(this.alloggio);

    const db = await makeDb(config); 
    var results = {};

    await withTransaction(db, async() => {
      // inserimento utente
      let sql = "INSERT INTO Alloggio VALUES (UUID(),?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);";
      let values = [
        this.alloggio.proprietario = req.session.user.id_utente,
        this.alloggio.tipo_all,
        this.alloggio.nome_proprietario,
        this.alloggio.indirizzo,
        this.alloggio.n_civico,
        this.alloggio.cap,
        this.alloggio.regione,
        this.alloggio.citta, 
        this.alloggio.provincia, 
        this.alloggio.num_ospiti,
        this.alloggio.distanza_centro,
        this.alloggio.num_letti_singoli,
        this.alloggio.num_letti_matrimoniali,
        this.alloggio.num_camere,
        this.alloggio.num_bagni,
        this.alloggio.cucina ,
        this.alloggio.lavanderia ,
        this.alloggio.aria_condizionata ,
        this.alloggio.wifi ,
        this.alloggio.colazione ,
        this.alloggio.asciugacapelli  ,
        this.alloggio.tv  ,
        this.alloggio.carta_igienica  ,
        this.alloggio.sapone_mani_corpo  ,
        this.alloggio.asciugamano  ,
        this.alloggio.accappatoio  ,
        this.alloggio.cuscino  ,
        this.alloggio.lenzuola  ,
        this.alloggio.titolo ,
        this.alloggio.descrizione_alloggio ,
        this.alloggio.descrizione_regole ,
        this.alloggio.note,
        this.alloggio.tasse,
        this.alloggio.prezzo,

        // sostituisco gli oggetti foto con il filename della foto che è una stringa

        this.alloggio.foto[0] = (this.alloggio.foto[0] != undefined ? this.alloggio.foto[0].filename : null),
        this.alloggio.foto[1] = (this.alloggio.foto[1] != undefined ? this.alloggio.foto[1].filename : null),
        this.alloggio.foto[2] = (this.alloggio.foto[2] != undefined ? this.alloggio.foto[2].filename : null),
        this.alloggio.foto[3] = (this.alloggio.foto[3] != undefined ? this.alloggio.foto[3].filename : null),
        this.alloggio.foto[4] = (this.alloggio.foto[4] != undefined ? this.alloggio.foto[4].filename : null),
        this.alloggio.foto[5] = (this.alloggio.foto[5] != undefined ? this.alloggio.foto[5].filename : null)
      ];

      results = await db.query(sql, values)
              .catch(err => {
                  throw err;
              });

    });

    res.render('aggiungiAlloggioDir/agg-all-5');

  } catch(error){
    console.log(error);
    next(createError(500));
  }
});


/* GET agg-all-5 */
router.get('/agg-all-5', function(req, res, next) {
res.render('aggiungiAlloggioDir/agg-all-5');
});

module.exports = router;