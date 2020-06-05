var express = require('express');
var router = express.Router();

/* GET prenotazionePg1 */
router.get('/prenotazionePg1', function(req, res, next) {
    res.render('prenotazioneDir/prenotazionePg1');
});

/* GET prenotazionePg2 */
router.get('/prenotazionePg2', function(req, res, next) {
    res.render('prenotazioneDir/prenotazionePg2');
});

/* GET prenotazionePg3 */
router.get('/prenotazionePg3', function(req, res, next) {
    res.render('prenotazioneDir/prenotazionePg3');
});

/* GET prenotazionePg4 */
router.get('/prenotazionePg4', function(req, res, next) {
    res.render('prenotazioneDir/prenotazionePg4');
});

/* GET recapPrenotazione */
router.get('/recapPrenotazione', function(req, res, next) {
    res.render('prenotazioneDir/recapPrenotazione');
});

module.exports = router;