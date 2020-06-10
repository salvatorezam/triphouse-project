var createError = require('http-errors');
var express = require('express');
var router = express.Router();

//variabili che mi servono

var idUtente = "";
let alloggiInseriti = [];


/*carichiamo il middleware*/

const { config } = require('../db/config');
const { makeDb, withTransaction } = require('../db/dbmiddleware');

/* GET visualizzaAlloggioInserito */
router.get('/visualizzaAlloggio', function(req, res, next) {
  res.render('visualizzaAlloggio');
});


/* GET visualizzaListaAlloggiInseriti */
router.get('/visualizzaListaAlloggiInseriti', getListaPrenotazioniEffettuate);

async function getListaPrenotazioniEffettuate(req, res, next) {

  const db = await makeDb(config);
  let results = {};
 
  
    try {
      await withTransaction(db, async() => {

          let sql0 = "SELECT * FROM USERS_SESSIONS WHERE session_id = ?;";
          results = await db.query(sql0, [req.session.id])
              .catch(err => {
                  throw err;
              });

          if (results.affectedRows == 0) {
              console.log('Sessione Utente non trovata!');
              next(createError(404, 'Sessione Utente non trovata'));
          } else {
              let datiUtente = JSON.parse(results[0].data);
              idUtente = datiUtente.user.id_utente;
          }
          
          let sql1 = "SELECT* FROM Alloggio a WHERE proprietario = ?";
          results1 = await db.query(sql1, [idUtente])
              .catch(err => {
                  throw err;
              });

          alloggiInseriti = results1;
          
          //res.render('finestraListaPrenotazioniEffettuate', {data : {dataC: prenConcluse, dataNC: prenNonConcluse}}); //di mauro

          res.render('visualizzaListaAlloggiInseriti', {data : alloggiInseriti});

      });
    } catch (err) {
        console.log(err);
        next(createError(500));
    }
}

module.exports = router;