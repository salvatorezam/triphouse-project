var createError = require('http-errors');
var express = require('express');
var router = express.Router();

const { makeDb, withTransaction } = require('../db/dbmiddleware');

/* La rotta attuale è vietata */
router.get('/', function(req, res, next) {
    next(createError(403));
});


/* GET finestraListaPrenotazioniRicevute */
router.get('/finestraListaPrenotazioniRicevute', getListaPrenotazioniRicevute);

async function getListaPrenotazioniRicevute(req, res, next) {
    
    const db = await makeDb(config);
    let prenRicevute = {};

    try {
        await withTransaction(db, async() => {

            //DA DEFINIRE
            let sql = "SELECT p.ID_PREN AS ID_PREN, p.data_inizio AS data_inizio, p.data_fine AS data_fine, \
                        a.titolo AS titolo, a.tipo_all AS tipo_all, p.stato_prenotazione AS stato_prenotazione, \
                        ur.nome AS nome_ut, ur.cognome AS cognome_ut, p.prezzo_totale AS prezzo_totale, p.data_pren AS data_prenotazione, \
                        count(dos.ID_DO) AS num_ospiti \
                        FROM Prenotazione p, Alloggio a, UtenteRegistrato ur, DatiOspiti dos \
                        WHERE p.alloggio = a.ID_ALL AND p.utente = ur.ID_UR AND dos.prenotazione = p.ID_PREN \
                        GROUP BY p.ID_PREN;";
            prenRicevute = await db.query(sql)
                .catch(err => {
                    throw err;
                });

            for (el of prenRicevute) {
                listaIdPrenRicevute.push(el.ID_PREN);
            }

            //DA CANCELLARE
            console.log('prenotazioni RICEVUTE');
            console.log(prenRicevute.length);
            console.log({data : prenRicevute});

            res.render('finestraListaPrenotazioniRicevute', {data : prenRicevute});
        });
    } catch (err) {
        console.log(err);
        next(createError(500));
    }
}

