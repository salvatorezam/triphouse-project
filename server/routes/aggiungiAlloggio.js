var createError = require('http-errors');
var express = require('express');
var router = express.Router();

/* GET agg-all-1 */
router.get('/agg-all-1', function(req, res, next) {
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


/*carichiamo il middleware*/

const { config } = require('../db/config');
const { makeDb, withTransaction } = require('../db/dbmiddleware');


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