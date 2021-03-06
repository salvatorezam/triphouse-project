var createError = require('http-errors');
var express = require('express');
var router = express.Router();

var recensioni = [];
var arrayAlloggi = [];
var inizioArray;
var fineArray;
var arrayAlloggiFiltri = [];
var inizioArrayFiltri;
var fineArrayFiltri;


/*carichiamo il middleware*/

const { config } = require('../db/config');
const { makeDb, withTransaction } = require('../db/dbmiddleware');


/* POST listaRicerca*/
router.post('/listaRicerca', listaRicerca);

async function listaRicerca(req, res, next) {

    let data_inizio;
    let data_fine;
    let n_Ospiti;

  const db = await makeDb(config);
  //let results = {};
 
    try {
      await withTransaction(db, async() => {

        let x = req.body.bookingDate.split(' to '); // divido le date in data inzio e data fine
        n_Ospiti = req.body.num_ospiti;
        data_inizio = x[0];
        data_fine = x[1];
        req.session.date={
            data_i : data_inizio,
            data_f : data_fine,
            data_n_o : n_Ospiti
        };

        
        // DATEDISPONIBILI ----------------
        let sql1 = "SELECT a.ID_ALL AS ID_ALL, a.proprietario AS proprietario, a.tipo_all AS tipo_all, a.nome_proprietario AS nome_proprietario, a.indirizzo AS indirizzo, a.n_civico AS n_civico, a.cap AS cap, a.regione AS regione, a.citta AS citta, a.provincia AS provincia, \
		a.num_ospiti_max AS num_ospiti_max, a.distanza_centro AS distanza_centro, a.num_letti_singoli AS num_letti_singoli, a.num_letti_matrimoniali AS num_letti_matrimoniali, a.num_camere AS num_camere, a.num_bagni AS num_bagni, a.cucina AS cucina, a.lavanderia AS lavanderia, \
		a.aria_condizionata AS aria_condizionata, a.wifi AS wifi, a.colazione AS colazione, a.asciugacapelli AS asciugacapelli, a.tv AS tv, a.carta_igienica AS carta_igienica, a.sapone_mani_corpo AS sapone_mani_corpo, a.asciugamano AS asciugacapelli, a.accappatoio AS accappatoio, a.cuscino AS cuscino,\
		a.lenzuola AS lenzuola, a.titolo AS titolo, a.descrizione_alloggio AS descrizione_alloggio, a.descrizione_regole AS descrizione_regole, a.note AS note, a.tasse AS tasse, a.prezzo AS prezzo, a.foto_0 AS foto_0, a.foto_1 AS foto_1,a.foto_2 AS foto_2,a.foto_3 As foto_3,a.foto_4 AS foto_4,a.foto_5 AS foto_5\
        FROM Alloggio a \
        WHERE a.citta = ? AND a.num_ospiti_max >= ? AND a.ID_ALL NOT IN (SELECT d.alloggio \
																		FROM dateindisponibili d \
                                                                        WHERE (? >= d.data_inizio AND ? <= d.data_fine ) OR (? > d.data_inizio AND ? < data_fine) OR ( ? < d.data_inizio AND ? > d.data_fine ));\
        SELECT r.ID_RA AS ID_RA, r.testo AS testo, r.data_rec AS data_rec, r.scrittore AS scrittore, u.nome AS nome_scrittore, \
                r.alloggio AS alloggio, r.prenotazione AS prenotazione, r.valutazione AS valutazione \
        FROM recensiscialloggio r, alloggio a, utenteregistrato u \
        WHERE (r.alloggio = a.ID_ALL) AND (a.citta = ?) AND (a.num_ospiti_max >= ?) AND (r.scrittore = u.ID_UR);";

        results1 = await db.query(sql1, [req.body.citta, req.body.num_ospiti, data_inizio, data_inizio, data_fine, data_fine, data_inizio, data_fine, req.body.citta, req.body.num_ospiti])
            .catch(err => {
                throw err;
            });
            
        arrayAlloggi = results1[0];
        recensioni = results1[1];

        if(arrayAlloggi.length > 6){
            inizioArray = 0;
            fineArray = 6;
        }
        else{
            inizioArray = 0;
            fineArray = arrayAlloggi.length;
        }
        // il dato tipo indica se è una ricerca in base ai filtri o meno; se è 0 non è in base ai filtri
        res.render('listaRicerca', {data : {array : arrayAlloggi, inizioCount : inizioArray, fineCount : fineArray, tipo : 0}});
    
      });
    } catch (err) {
        console.log(err);
        next(createError(500));
    }
}

/*GET visualizzaAlloggio */

router.get('/visualizzaAlloggioRicerca', visualizzaAlloggioRicerca);

async function visualizzaAlloggioRicerca(req, res, next){

    let alloggio;
    let recensioni_a = [];
    let contatore = 0;

    var utenteLogBool = false;

    if (req.session.user != undefined && req.app.locals.users.has(req.session.user.id_utente)) {
        
        utenteLogBool = true;
    }

    try{
        arrayAlloggi.forEach(element => {
            
            if(element.ID_ALL == req.query.idAlloggio){

                req.session.alloggio = element;
                alloggio = element;
            }
        });

        recensioni.forEach(element => {

            if(element.alloggio == req.query.idAlloggio){

                recensioni_a[contatore] = element;
                contatore++;
            }
        })


        res.render('visualizzaAlloggioRicerca', {data : {data_a :alloggio, data_r: recensioni_a, utLog: utenteLogBool}});

    } catch (err) {
        console.log(err);
        next(createError(500));
    }
};


/*POST ricercaFiltri*/
router.post('/ricercaFiltri', ricercaFiltri);

async function ricercaFiltri(req, res, next){

    let alloggiFiltrati = [];
    let count = 0;

    try {
       
        // FILRO IN BASE AL TIPO DI ALLOGGIO
        arrayAlloggi.forEach(element => {
            
            if(req.body.tipoAlloggio1 == req.body.tipoAlloggio2){

                alloggiFiltrati = arrayAlloggi;
            }
            else if(req.body.tipoAlloggio1 && (element.tipo_all == 'B&B')){

                alloggiFiltrati[count] = element;
                count++
            }
            else if( req.body.tipoAlloggio2 && (element.tipo_all == 'casa vacanza' || element.tipo_all == 'Casa Vacanza')){
                alloggiFiltrati[count] = element;
                count++
                // DA SISTEMARE LA CONDIZIONE DI SOPRA
            }
        });

        //FILTO IN BASE AL PREZZO        DA FARE
        
        console.log(req.body.pricefrom);
        console.log(req.body.priceto);

        let alloggiFiltratiPrezzo = [];
        let z = 0;

        alloggiFiltrati.forEach(element => {
            
            if(req.body.pricefrom == 0 && req.body.priceto == 200){
                alloggiFiltratiPrezzo = alloggiFiltrati;
            }
            else if(element.prezzo > req.body.pricefrom && element.prezzo < req.body.priceto){

                alloggiFiltratiPrezzo[z] = element;
                z++;
            }
        });

        alloggiFiltrati = alloggiFiltratiPrezzo;

        //FILTRO IN BASE AI SERVIZI

        countFiltri = 0;

        req.body.cucina ? countFiltri++ : countFiltri = countFiltri;
        req.body.lavanderia  ? countFiltri++ : countFiltri = countFiltri;
        req.body.aria_condizionata  ? countFiltri++ : countFiltri = countFiltri;
        req.body.wifi  ? countFiltri++ : countFiltri = countFiltri;
        req.body.colazione  ? countFiltri++ : countFiltri = countFiltri;
        req.body.asciugacapelli  ? countFiltri++ : countFiltri = countFiltri;
        req.body.tv  ? countFiltri++ : countFiltri = countFiltri;
        req.body.carta_igienica  ? countFiltri++ : countFiltri = countFiltri;
        req.body.sapone_mani_corpo  ? countFiltri++ : countFiltri = countFiltri;
        req.body.asciugamano  ? countFiltri++ : countFiltri = countFiltri;
        req.body.accappatoio  ? countFiltri++ : countFiltri = countFiltri;
        req.body.cuscino  ? countFiltri++ : countFiltri = countFiltri;
        req.body.lenzuola  ? countFiltri++ : countFiltri = countFiltri;

        console.log(countFiltri);

        let x=0; //contatore per elemento alloggiFiltratiServizi
        let alloggiFiltratiServizi = [];

        alloggiFiltrati.forEach(element => {

            let countElementFiltri=0;

            (element.cucina && req.body.cucina) ? countElementFiltri++ : countElementFiltri = countElementFiltri;
            (element.lavanderia && req.body.lavanderia) ? countElementFiltri++ : countElementFiltri = countElementFiltri;
            (element.aria_condizionata && req.body.aria_condizionata) ? countElementFiltri++ : countElementFiltri = countElementFiltri;
            (element.wifi && req.body.wifi) ? countElementFiltri++ : countElementFiltri = countElementFiltri;
            (element.colazione && req.body.colazione) ? countElementFiltri++ : countElementFiltri = countElementFiltri;
            (element.asciugacapelli && req.body.asciugacapelli) ? countElementFiltri++ : countElementFiltri = countElementFiltri;
            (element.tv && req.body.tv) ? countElementFiltri++ : countElementFiltri = countElementFiltri;
            (element.carta_igienica && req.body.carta_igienica) ? countElementFiltri++ : countElementFiltri = countElementFiltri;
            (element.sapone_mani_corpo && req.body.sapone_mani_corpo) ? countElementFiltri++ : countElementFiltri = countElementFiltri;
            (element.asciugamano && req.body.asciugamano) ? countElementFiltri++ : countElementFiltri = countElementFiltri;
            (element.accappatoio && req.body.accappatoio) ? countElementFiltri++ : countElementFiltri = countElementFiltri;
            (element.cuscino && req.body.cuscino) ? countElementFiltri++ : countElementFiltri = countElementFiltri;
            (element.lenzuola && req.body.lenzuola) ? countElementFiltri++ : countElementFiltri = countElementFiltri;

            if(countElementFiltri == countFiltri){
                
                alloggiFiltratiServizi[x] = element;
                x++;
            }
            
        });


        if((req.body.cucina || req.body.lavanderia || req.body.aria_condizionata || req.body.wifi || req.body.colazione || req.body.asciugacapelli ||
            req.body.tv || req.body.carta_igienica || req.body.sapone_mani_corpo || req.body.asciugamano || req.body.accappatoio ||
            req.body.cuscino || req.body.lenzuola) && alloggiFiltratiServizi.length == 0){
                alloggiFiltratiServizi = [];
            }
        else if(alloggiFiltratiServizi.length == 0){
            alloggiFiltratiServizi = alloggiFiltrati;
        }

        console.log(alloggiFiltratiServizi);

        //FILTRO IN BASE ALLA DISTANZA DAL CENTRO

        let alloggiFiltratiDistanza = [];
        let y = 0; //contatore per alloggi filtrati in base alla distanza dal centro

        alloggiFiltratiServizi.forEach(element => {
            
            if((req.body.distanza == 'D') && (element.distanza_centro == 'D')){

                alloggiFiltratiDistanza[y] = element;
                y++;
            }
            else if((req.body.distanza == 'M') && (element.distanza_centro == 'M')){

                alloggiFiltratiDistanza[y] = element;
                y++;
            }
            else if( (req.body.distanza == 'V') && (element.distanza_centro == 'V')){
                alloggiFiltratiDistanza[y] = element;
                y++;
                
            }
        });
        
        if(req.body.distanza && alloggiFiltratiDistanza.length == 0 ){
            alloggiFiltratiDistanza = [];
        }
        else if((alloggiFiltratiDistanza.length == 0)){
            alloggiFiltratiDistanza = alloggiFiltratiServizi
        };


        if(alloggiFiltratiDistanza.length > 6){
            inizioArrayFiltri = 0;
            fineArrayFiltri = 6;
        }
        else{
            inizioArrayFiltri = 0;
            fineArrayFiltri = alloggiFiltratiDistanza.length;
        }

        arrayAlloggiFiltri = alloggiFiltratiDistanza;

        res.render('listaRicerca', {data : {array : arrayAlloggiFiltri, inizioCount : inizioArrayFiltri, fineCount : fineArrayFiltri, tipo:1}});


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

    res.render('listaRicerca', {data : {array : arrayAlloggi, inizioCount : inizioArray, fineCount : fineArray, tipo: 0}})

}

/*GET paginaPrecedente*/

router.get('/paginaPrecedente', paginaPrecedente);

async function paginaPrecedente(req,res,next){


    fineArray = inizioArray;

    inizioArray = inizioArray - 6;


    res.render('listaRicerca', {data : {array : arrayAlloggi, inizioCount : inizioArray, fineCount : fineArray, tipo: 0}})

}

/* GET paginaSuccessivaFiltri */

router.get('/paginaSuccessivaFiltri', paginaSuccessivaFiltri);

async function paginaSuccessivaFiltri(req,res,next){

    inizioArrayFiltri = fineArrayFiltri;

    if(arrayAlloggiFiltri.length > (fineArrayFiltri + 6)){

        fineArrayFiltri = fineArrayFiltri + 6;
    }
    else{
        fineArrayFiltri = arrayAlloggiFiltri.length;
    }

    res.render('listaRicerca', {data : {array : arrayAlloggiFiltri, inizioCount : inizioArrayFiltri, fineCount : fineArrayFiltri, tipo: 1}})

}

/*GET paginaPrecedenteFiltri*/

router.get('/paginaPrecedenteFiltri', paginaPrecedenteFiltri);

async function paginaPrecedenteFiltri(req,res,next){


    fineArrayFiltri = inizioArrayFiltri;

    inizioArrayFiltri = inizioArrayFiltri - 6;


    res.render('listaRicerca', {data : {array : arrayAlloggiFiltri, inizioCount : inizioArrayFiltri, fineCount : fineArrayFiltri, tipo:1}})

}


module.exports = router;
