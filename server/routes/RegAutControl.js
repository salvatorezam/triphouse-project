var createError = require('http-errors');
var express = require('express');
var router = express.Router();

// istanziamo il modulo crypto e il config e il middleware per il db
const crypto = require('../db/config');
const { config } = require('../db/config');
const { makeDb, withTransaction } = require('../db/dbmiddleware')

/* La rotta /users è vietata */
router.get('/', function(req, res, next) {
    next(createError(403));
});

/* Registrazione Utente */
router.post('/utenteregistrato', registrazione);

// middleware di registrazione
async function registrazione(req, res, next) {
    // istanziamo il middleware
    const db = await makeDb(config);
    let results = {};
    try {

        await withTransaction(db, async() => {

             // inserimento utente
            results = await db.query('INSERT INTO UtenteRegistrato(nome, cognome, sesso, data_nascita, nazione_nascita,\
                citta_nascita, email, telefono, stato_host) VALUES (?,?,?,?,?,?,?,?,?)', [
                    req.body.nome,
                    req.body.cognome,
                    req.body.sesso,
                    req.body.data_nascita,
                    req.body.nazione_nascita,
                    req.body.citta_nascita,
                    req.body.email,
                    req.body.telefono,
                    req.body.stato_host
                ])
                .catch(err => {
                    throw err
                });

            console.log('Inserimento dati nuovo utente.');
            console.log(result.insertID);
            // render?
            /*
            // inserimento credenziali utente
            sql = 'INSERT INTO Credenziali VALUES (?,?)';
            values = [
                result.insertID, // sfrutto l'oggetto result che viene restituito dal metodo query per reperire l'indice dell'utente appena inserito
                req.body.password
            ];
            results = await db.query(sql, values).catch(err => {throw err});

            console.log(result);
            console.log(`Utente ${req.body.email} inserito!`);*/

            
            /*
            // generazione della password cifrata con SHA512
            result = await db.query('SELECT sha2(?,512) AS encpwd', [req.body.loginPassword])
                .catch(err => {
                    throw err;
                });

            let encpwd = results[0].encpwd;
            console.log('Password cifrata');
            console.log(results);

            results = await db.query('INSERT INTO `autenticazione` \
            (id_utente, email, password) VALUES ?', [
                    [
                        [
                            id_utente,
                            req.body.email,
                            encpwd
                        ]
                    ]
                ])
                .catch(err => {
                    throw err;
                });

            
            res.render('landing', { title: 'Registrazione effettuata' }); */

        });
    } catch (err) {
        console.log(err);
        next(createError(500));
    }
}

module.exports = router;