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

module.exports = router;
