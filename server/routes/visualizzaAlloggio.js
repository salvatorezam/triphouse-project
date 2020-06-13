var createError = require('http-errors');
var express = require('express');
var router = express.Router();

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

router.post('/effettuaModifiche', effettuaModifiche);

async function effettuaModifiche(req, res, next){

    try{


        


    } catch (err) {
        console.log(err);
        next(createError(500));
    }

};

module.exports = router;