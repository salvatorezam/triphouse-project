var createError = require('http-errors');
var express = require('express');
var router = express.Router();

// istanziamo il modulo crypto e il config, il middleware per il db e per il mailsender
const crypto = require('../db/config');
const { config } = require('../db/config');
const { makeDb, withTransaction } = require('../db/dbmiddleware');
const { transporter } = require('../mailsender/mailsender-config');
const { sendRegistrationEmail } = require('../mailsender/mailsender-middleware');

/* La rotta /users è vietata */
router.get('/', function(req, res, next) {
    next(createError(403));
});

/* Controllo email */
router.post('/controllomail', controllaMail);

/* Registrazione Utente */
router.post('/utenteregistrato', registrazione);

async function controllaMail(req, res, next) {
    const db = await makeDb(config);
    let results = {};
    try {
        await withTransaction(db, async() => {      
            results = await db.query("SELECT * FROM UtenteRegistrato WHERE email = N'" + req.body.email + "'")
                .catch(err => {
                throw err;
                });
            if (results.length == 0) 
                res.send('EMAIL-OK');  
            else
                res.send('EMAIL-NOT-OK')
        });
    } catch (err) {
        console.log(err);
        next(createError(500));
    }
}

// middleware di registrazione
async function registrazione(req, res, next) {
    // istanziamo il middleware
    const db = await makeDb(config);
    let results = {};
    try {
        await withTransaction(db, async() => {  
            // inserimento utente
            results = await db.query("INSERT INTO UtenteRegistrato VALUES (UUID(),?,?,?,?,?,?,?,?,?);\
                                      INSERT INTO Credenziali(email, password_hash) VALUES (?,?);", 
                        [ 
                            req.body.nome,
                            req.body.cognome,
                            req.body.sesso,
                            req.body.nazione_nascita,
                            req.body.citta_nascita,
                            req.body.data_nascita,
                            req.body.email,
                            req.body.telefono,
                            false,
                            req.body.email,
                            req.body.password
                        ])
                        .catch(err => {
                        throw err;
                        });

            console.log('Inserimento dati nuovo utente.');
            console.log(results);

            console.log(`Utente ${req.body.email} inserito!`);
                    
            // render?
            res.redirect('/');
           
            // gestione dell'invio della mail di conferma
            results = await sendRegistrationEmail(transporter, req.body.email).catch(err => {throw err;});
        
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