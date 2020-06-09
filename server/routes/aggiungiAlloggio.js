var createError = require('http-errors');
var express = require('express');
var router = express.Router();

/*carichiamo il middleware*/

const { config } = require('../db/config');
const { makeDb, withTransaction } = require('../db/dbmiddleware');

var moduloAlloggio = require('../public/javascripts/Alloggio.js');

/* GET agg-all-1 */
router.get('/agg-all-1', function(req, res, next) {

    this.alloggio = new moduloAlloggio();
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

    this.alloggio.num_ospiti_max = req.body.ciao;
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