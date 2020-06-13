var createError = require('http-errors');
var express = require('express');
var router = express.Router();

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

//variabili che mi servono

var idUtente = "";
let alloggiInseriti = [];
let recensioni = [];
let alloggioVisualizzato;


/*carichiamo il middleware*/

const { config } = require('../db/config');
const { makeDb, withTransaction } = require('../db/dbmiddleware');



/* GET visualizzaListaAlloggiInseriti */
router.get('/visualizzaListaAlloggiInseriti', listaAlloggiInseriti);

async function listaAlloggiInseriti(req, res, next) {

  const db = await makeDb(config);
  let results = {};
 
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
          
          let sql1 = "  SELECT* FROM Alloggio a WHERE a.proprietario = ?; \
                        SELECT r.ID_RA AS ID_RA, r.testo AS testo, r.data_rec AS data_rec, r.scrittore AS scrittore, u.nome AS nome_scrittore, \
                                r.alloggio AS alloggio, r.prenotazione AS prenotazione, r.valutazione AS valutazione \
                        FROM recensiscialloggio r, alloggio a, utenteregistrato u \
                        WHERE (r.alloggio = a.ID_ALL) AND (a.proprietario = ?) AND (r.scrittore = u.ID_UR);";
          results1 = await db.query(sql1, [idUtente, idUtente])
              .catch(err => {
                  throw err;
              });

          alloggiInseriti = results1[0];
          recensioni = results1[1];
          
          //res.render('finestraListaPrenotazioniEffettuate', {data : {dataC: prenConcluse, dataNC: prenNonConcluse}}); //di mauro

          res.render('visualizzaListaAlloggiInseriti', {data : alloggiInseriti});
    
      });
    } catch (err) {
        console.log(err);
        next(createError(500));
    }
}


/* GET visualizzaAlloggioInserito */
router.get('/visualizzaAlloggioInserito', function(req, res, next) {

    let alloggio;
    let recensioni_a = [];
    let contatore = 0;

    alloggiInseriti.forEach(element => {
        
        if(element.ID_ALL == req.query.id){

            console.log('funziona: ');
            console.log( element);
            return alloggio = element;
        }
    });

    recensioni.forEach(element => {

        if(element.alloggio == req.query.id){

            recensioni_a[contatore] = element;
            contatore++;
        }
    })

    alloggioVisualizzato = alloggio;

    res.render('visualizzaAlloggioInserito', {data : {data_a :alloggio, data_r: recensioni_a }});
  });


/*GET modificaInformazioniAlloggio */

router.get('/modificaInformazioniAlloggio', function(req, res, next){

    res.render('modificaInformazioniAlloggio', {data: alloggioVisualizzato });

});

/* POST EFFETTUA MODIFICHE*/

router.post('/effettuaModifiche', upload, async function (req, res, next){

    try{

        //AGGIORNAMENTO VARIABILI INFORMAZIONI DI BASE
        (req.body.tipo_all ? alloggioVisualizzato.tipo_all = req.body.tipo_all : null);
        (req.body.nome_proprietario ? alloggioVisualizzato.nome_proprietario = req.body.nome_proprietario : null);
        if(req.body.indirizzo){

            let v = req.body.indirizzo.split(',');
            alloggioVisualizzato.indirizzo = v[0].trim();
            alloggioVisualizzato.n_civico = v[1].trim();
        }
        (req.body.citta ? alloggioVisualizzato.citta = req.body.citta : null);
        (req.body.regione ? alloggioVisualizzato.regione = req.body.regione : null);
        (req.body.provincia ? alloggioVisualizzato.provincia = req.body.provincia : null);
        (req.body.cap ? alloggioVisualizzato.cap = req.body.cap : null);
        (req.body.num_ospiti ? alloggioVisualizzato.num_ospiti_max = req.body.num_ospiti : null);
        (req.body.distanza_centro ? alloggioVisualizzato.distanza_centro = req.body.distanza_centro : null);

        //AGGIORNAMENTO VARIABILI SERVIZI

        if(req.body.num_letti_singoli && req.body.num_letti_matrimoniali && req.body.num_camere && req.body.num_bagni){

            (req.body.num_letti_singoli ? alloggioVisualizzato.num_letti_singoli = req.body.num_letti_singoli : null);
            (req.body.num_letti_matrimoniali ? alloggioVisualizzato.num_letti_matrimoniali = req.body.num_letti_matrimoniali : null);
            (req.body.num_camere ? alloggioVisualizzato.num_camere = req.body.num_camere : null);
            (req.body.num_bagni ? alloggioVisualizzato.num_bagni = req.body.num_bagni : null);

            (req.body.cucina ? alloggioVisualizzato.cucina = true : alloggioVisualizzato.cucina = false);
            (req.body.lavanderia ? alloggioVisualizzato.lavanderia = true : alloggioVisualizzato.lavanderia = false);
            (req.body.aria_condizionata ? alloggioVisualizzato.aria_condizionata = true : alloggioVisualizzato.aria_condizionata = false);
            (req.body.wifi ? alloggioVisualizzato.wifi = true : alloggioVisualizzato.wifi = false);
            (req.body.colazione ? alloggioVisualizzato.colazione = true : alloggioVisualizzato.colazione = false);
            (req.body.asciugacapelli ? alloggioVisualizzato.asciugacapelli = true : alloggioVisualizzato.asciugacapelli =  false);
            (req.body.tv ? alloggioVisualizzato.tv = true : alloggioVisualizzato.tv = false);
            (req.body.carta_igienica ? alloggioVisualizzato.carta_igienica = true : alloggioVisualizzato.carta_igienica = false);
            (req.body.sapone_mani_corpo ? alloggioVisualizzato.sapone_mani_corpo = true : alloggioVisualizzato.sapone_mani_corpo = false);
            (req.body.asciugamano ? alloggioVisualizzato.asciugamano = true : alloggioVisualizzato.asciugamano = false);
            (req.body.accappatoio ? alloggioVisualizzato.accappatoio = true : alloggioVisualizzato.accappatoio = false);
            (req.body.cuscino ? alloggioVisualizzato.cuscino = true : alloggioVisualizzato.cuscino = false);
            (req.body.lenzuola ? alloggioVisualizzato.lenzuola = true : alloggioVisualizzato.lenzuola = false);
        }
        //AGGIORNAMENTO VARIABILI TESTO

        (req.body.titolo_annuncio ? alloggioVisualizzato.titolo = req.body.titolo_annuncio : null);
        (req.body.descrizione_alloggio ? alloggioVisualizzato.descrizione_alloggio = req.body.descrizione_alloggio : null);
        (req.body.descrizione_regole ? alloggioVisualizzato.descrizione_regole = req.body.descrizione_regole : null);
        (req.body.prezzo ? alloggioVisualizzato.prezzo = req.body.prezzo : null);
        (req.body.tassa ? alloggioVisualizzato.tasse = req.body.tassa : null);

        if(req.body.titolo_annuncio){

            (req.body.descrizione_note ? alloggioVisualizzato.note = req.body.descrizione_note : alloggioVisualizzato.note = undefined);
        }

        //AGGIORNAMENTO FOTO

        let arrayFoto = [];


        if(req.files && req.files.length != 0){
            for(var x  = 0; x < req.files.length; x++){
                arrayFoto[x]= req.files[x].filename;
            }

            (arrayFoto[0] ? alloggioVisualizzato.foto_0 = arrayFoto[0]  : alloggioVisualizzato.foto_0 = undefined);
            (arrayFoto[1] ? alloggioVisualizzato.foto_1 = arrayFoto[1]  : alloggioVisualizzato.foto_1 = undefined);
            (arrayFoto[2] ? alloggioVisualizzato.foto_2 = arrayFoto[2]  : alloggioVisualizzato.foto_2 = undefined);
            (arrayFoto[3] ? alloggioVisualizzato.foto_3 = arrayFoto[3]  : alloggioVisualizzato.foto_3 = undefined);
            (arrayFoto[4] ? alloggioVisualizzato.foto_4 = arrayFoto[4]  : alloggioVisualizzato.foto_4 = undefined);
            (arrayFoto[5] ? alloggioVisualizzato.foto_5 = arrayFoto[5]  : alloggioVisualizzato.foto_5 = undefined);
        }


        const db = await makeDb(config); 
        var results = {};

        await withTransaction(db, async() => {
        
        let sql = "UPDATE Alloggio SET tipo_all = ?, nome_proprietario  = ?, indirizzo  = ?, n_civico  = ?, cap  = ?, regione  = ?, citta  = ?, provincia  = ?, \
                    num_ospiti_max  = ?, distanza_centro  = ?, num_letti_singoli  = ?, num_letti_matrimoniali  = ?, num_camere  = ?, num_bagni  = ?, cucina  = ?,\
                    lavanderia  = ?, aria_condizionata  = ?, wifi  = ?, colazione  = ?, asciugacapelli  = ?, tv  = ?, carta_igienica  = ?, sapone_mani_corpo  = ?,\
                    asciugamano = ?, accappatoio = ?, cuscino = ?, lenzuola = ?, titolo = ?, descrizione_alloggio= ?, descrizione_regole = ?, note= ?, tasse = ?, \
                    prezzo = ?, foto_0 = ?, foto_1 = ?, foto_2 = ?, foto_3 = ?, foto_4 = ?, foto_5 = ?\
                    WHERE ID_ALL = ?";
        let values = [
            
            alloggioVisualizzato.tipo_all,
            alloggioVisualizzato.nome_proprietario,
            alloggioVisualizzato.indirizzo,
            alloggioVisualizzato.n_civico,
            alloggioVisualizzato.cap,
            alloggioVisualizzato.regione,
            alloggioVisualizzato.citta,
            alloggioVisualizzato.provincia,
            alloggioVisualizzato.num_ospiti_max,
            alloggioVisualizzato.distanza_centro,
            alloggioVisualizzato.num_letti_singoli,
            alloggioVisualizzato.num_letti_matrimoniali,
            alloggioVisualizzato.num_camere,
            alloggioVisualizzato.num_bagni,
            alloggioVisualizzato.cucina,
            alloggioVisualizzato.lavanderia,
            alloggioVisualizzato.aria_condizionata,
            alloggioVisualizzato.wifi,
            alloggioVisualizzato.colazione,
            alloggioVisualizzato.asciugacapelli,
            alloggioVisualizzato.tv,
            alloggioVisualizzato.carta_igienica,
            alloggioVisualizzato.sapone_mani_corpo,
            alloggioVisualizzato.asciugamano,
            alloggioVisualizzato.accappatoio,
            alloggioVisualizzato.cuscino,
            alloggioVisualizzato.lenzuola,
            alloggioVisualizzato.titolo,
            alloggioVisualizzato.descrizione_alloggio,
            alloggioVisualizzato.descrizione_regole,
            alloggioVisualizzato.note,
            alloggioVisualizzato.tasse,
            alloggioVisualizzato.prezzo,
            alloggioVisualizzato.foto_0,
            alloggioVisualizzato.foto_1,
            alloggioVisualizzato.foto_2,
            alloggioVisualizzato.foto_3,
            alloggioVisualizzato.foto_4,
            alloggioVisualizzato.foto_5,
            alloggioVisualizzato.ID_ALL
            
        ];

        results = await db.query(sql, values)
                .catch(err => {
                    throw err;
                });

        });

        res.render('modificaInformazioniAlloggio', {data : alloggioVisualizzato});



    } catch (err) {
        console.log(err);
        next(createError(500));
    }

});

/* GET RIMUOVI ALLOGGIO*/

router.get('/rimuoviAlloggio', rimuoviAlloggio);

async function rimuoviAlloggio(req, res, next){

    try {

        const db = await makeDb(config); 
        var results = {};

        await withTransaction(db, async() => {
        
        let sql = "DELETE FROM Alloggio WHERE ID_ALL = ? ";
        let values = [
            alloggioVisualizzato.ID_ALL
        ];

        results = await db.query(sql, values)
                .catch(err => {
                    throw err;
                });

        });

        res.render('index');

        
    } catch (err) {
        console.log(err);
        next(createError(500));
    }
}

module.exports = router;