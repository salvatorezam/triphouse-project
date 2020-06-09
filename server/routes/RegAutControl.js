var createError = require('http-errors');
var express = require('express');
var router = express.Router();

// istanziamo il modulo crypto e il config, il middleware per il db e per il mailsender
const { config } = require('../db/config');
const { makeDb, withTransaction } = require('../db/dbmiddleware');
const { sha512 } = require('../hashing/hashingmiddleware');
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

            // generazione dell'hash della password con una stringa casuale come salt
            let hashedPasswordData = sha512(req.body.password);
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
            results = sendRegistrationEmail(transporter, req.body.email).catch(err => {throw err;});
                    
            // render?
            res.redirect('/');
        });
    } catch (err) {
        console.log(err);
        next(createError(500));
    }
}


router.post('/accesso', autenticazione);


async function autenticazione(req, res, next) {
    // istanziamo il middleware
    const db = await makeDb(config);
    let results = {};
    try {
        await withTransaction(db, async() => {  
            // ricerca utente
            results = await db.query("SELECT email, password_hash FROM Credenziali WHERE email=?;", 
                        req.body.loginUsername)
                        .catch(err => {
                        throw err;
                        });



            if (results.affectedRows == 0) {
                console.log('Utente non trovato!');
                next(createError(404, 'Utente non trovato'));
            } else {
                let pwd = req.body.loginPassword; // istanziamo l'algoritmo di hashing
                //pwdhash.update(req.body.pass); // cifriamo la password
                //let encpwd = pwdhash.digest('hex'); // otteniamo la stringa esadecimale

                if (pwd != results[0].password_hash) {
                    // password non coincidenti
                    console.log('Password errata!');
                    next(createError(403, 'Password errata'));
                } else {
                    console.log('Utente autenticato');
                    //console.log(results);
                }
                    // recupero dello user id
                   // let id_utente = results[0].nome_cognome;

            }
                    
            // render?
            res.redirect('/');

        });
    } catch (err) {
        console.log(err);
        next(createError(500));
    }
}

module.exports = router;