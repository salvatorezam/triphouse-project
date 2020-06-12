var createError = require('http-errors');
var express = require('express');
var router = express.Router();

var arrayAlloggi = [];
var inizioArray;
var fineArray;


/*carichiamo il middleware*/

const { config } = require('../db/config');
const { makeDb, withTransaction } = require('../db/dbmiddleware');


/* POST listaRicerca*/
router.post('/listaRicerca', listaRicerca);

async function listaRicerca(req, res, next) {

    let data_inizio;
    let data_fine;

  const db = await makeDb(config);
  //let results = {};
 
    try {
      await withTransaction(db, async() => {

        let x = req.body.bookingDate.split(' to '); // divido le date in data inzio e data fine
        data_inizio = x[0];
        data_fine = x[1];

        let sql1 = "SELECT a.ID_ALL AS ID_ALL, a.proprietario AS proprietario, a.tipo_all AS tipo_all, a.nome_proprietario AS nome_proprietario, a.indirizzo AS indirizzo, a.n_civico AS n_civico, a.cap AS cap, a.regione AS regione, a.citta AS citta, a.provincia AS provincia, \
		a.num_ospiti_max AS num_ospiti_max, a.distanza_centro AS distanza_centro, a.num_letti_singoli AS num_letti_singoli, a.num_letti_matrimoniali AS num_letti_matrimoniali, a.num_camere AS num_camere, a.num_bagni AS num_bagni, a.cucina AS cucina, a.lavanderia AS lavanderia, \
		a.aria_condizionata AS aria_condizionata, a.wifi AS wifi, a.colazione AS colazione, a.asciugacapelli AS asciugacapelli, a.tv AS tv, a.carta_igienica AS carta_igienica, a.sapone_mani_corpo AS sapone_mani_corpo, a.asciugamano AS asciugacapelli, a.accappatoio AS accappatoio, a.cuscino AS cuscino,\
		a.lenzuola AS lenzuola, a.titolo AS titolo, a.descrizione_alloggio AS descrizione_alloggio, a.descrizione_regole AS descrizione_regole, a.note AS note, a.tasse AS tasse, a.prezzo AS prezzo, a.foto_0 AS foto_0, a.foto_1 AS foto_1,a.foto_2 AS foto_2,a.foto_3 As foto_3,a.foto_4 AS foto_4,a.foto_5 AS foto_5\
        FROM Alloggio a \
        WHERE a.citta = ? AND a.num_ospiti_max > ? AND a.ID_ALL NOT IN (SELECT d.alloggio \
																		FROM datedisponibili d \
																		WHERE (? >= d.data_inizio AND ? <= d.data_fine ) OR (? > d.data_inizio AND ? < data_fine) OR ( ? < d.data_inizio AND ? > d.data_fine ));";

        results1 = await db.query(sql1, [req.body.citta, req.body.num_ospiti, data_inizio, data_inizio, data_fine, data_fine, data_inizio, data_fine])
            .catch(err => {
                throw err;
            });
            
        arrayAlloggi = results1;

        if(arrayAlloggi.length > 6){
            inizioArray = 0;
            fineArray = 6;
        }
        else{
            inizioArray = 0;
            fineArray = arrayAlloggi.length;
        }

        res.render('listaRicerca', {data : {array : arrayAlloggi, inizioCount : inizioArray, fineCount : fineArray}});
    
      });
    } catch (err) {
        console.log(err);
        next(createError(500));
    }
}

/* GET paginaSuccessiva */

router.get('/paginaSuccessiva', paginaSuccessiva);

async function paginaSuccessiva(req,res,next){

    inizioArray = fineArray;

    if(arrayAlloggi.length > (fineArray + 6)){

        fineArray = fineArray + 6;
    }
    else{
        fineArray = arrayAlloggi.length;
    }

    res.render('listaRicerca', {data : {array : arrayAlloggi, inizioCount : inizioArray, fineCount : fineArray}})

}

/*GET paginaPrecedente*/

router.get('/paginaPrecedente', paginaPrecedente);

async function paginaPrecedente(req,res,next){


    fineArray = inizioArray;

    inizioArray = inizioArray - 6;


    res.render('listaRicerca', {data : {array : arrayAlloggi, inizioCount : inizioArray, fineCount : fineArray}})

}


module.exports = router;
