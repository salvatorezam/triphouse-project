var createError = require('http-errors');
var express = require('express');
var router = express.Router();

// istanziamo il modulo crypto e il config, il middleware per il db e per il mailsender
const { config } = require('../db/config');
const { makeDb, withTransaction } = require('../db/dbmiddleware');
const { generateSalt, sha512 } = require('../hashing/hashingmiddleware');
const { transporter } = require('../mailsender/mailsender-config');
const { sendRegistrationEmail } = require('../mailsender/mailsender-middleware');

/* La rotta attuale è vietata */
router.get('/', function(req, res, next) {
    next(createError(403));
});

/* Controllo email */
router.post('/controllomail', controllaMail);

/* Registrazione Utente */
router.post('/utenteregistrato', registrazione);

/* Autenticazione Utente */
router.post('/accesso', autenticazione);


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

            // generazione dell'hash della password con una stringa casuale come salt
            let hashedPasswordData = sha512(req.body.password, generateSalt());
            console.log('Hash calculated.');
            
            // inserimento utente
            results = await db.query("INSERT INTO UtenteRegistrato VALUES (UUID(),?,?,?,?,?,?,?,?,?);\
                                      INSERT INTO Credenziali(email, salt, password_hash) VALUES (?,?,?);", 
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
                            hashedPasswordData.salt,
                            hashedPasswordData.passwordHash
                        ])
                        .catch(err => {
                            throw err;
                        });

            console.log('Inserimento dati nuovo utente.');
            console.log(results);

            console.log(`Utente ${req.body.email} inserito!`);

            // Invio della mail di conferma
            // results = sendRegistrationEmail(transporter, req.body.email).catch(err => {throw err;});
                    
            // render?
            res.redirect('/');
        });
    } catch (err) {
        console.log(err);
        next(createError(500));
    }
}

async function autenticazione(req, res, next) { // sistemare il messaggio di errore per password e utente non validi
    // istanziamo il middleware
    const db = await makeDb(config);
    let results = {};
    try {
        await withTransaction(db, async() => {  
            // ricerca utente
            results = await db.query("SELECT ur.ID_UR AS ID_UR, c.email AS email, \
                                    c.salt AS salt, c.password_hash AS password_hash \
                                    FROM Credenziali c, UtenteRegistrato ur \
                                    WHERE ur.email = c.email AND c.email=?;", 
                        req.body.loginUsername)
                        .catch(err => {
                            throw err;
                        });

            if (results.length == 0) {
                console.log('Utente non trovato!');
                res.send('USER-NOT-FOUND');
                //next(createError(404, 'Utente non trovato'));
            } else {

                let hashedPasswordDataLogin = sha512(req.body.loginPassword, results[0].salt);

                if (hashedPasswordDataLogin.passwordHash == results[0].password_hash) {
                    console.log('Autenticazione riuscita.');
                    //console.log(results);
                    req.session.user = {
                        loggedin : true,
                        id_utente : results[0].ID_UR,
                    };
                    req.session.save();

                    res.redirect('/');
                }
                else {
                    res.send('WRONG-PASSWORD');
                    //next(createError(403, 'Password errata'));
                }
            }
        });
    } catch (err) {
        console.log(err);
        next(createError(500));
    }
}

module.exports = router;