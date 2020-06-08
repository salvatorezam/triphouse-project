var createError = require('http-errors');
var express = require('express');
var router = express.Router();

/*carichiamo il middleware*/

const { config } = require('../db/config');
const { makeDb, withTransaction } = require('../db/dbmiddleware');

/* GET visualizzaAlloggioInserito */
router.get('/visualizzaAlloggio', function(req, res, next) {
  res.render('visualizzaAlloggio');
});

module.exports = router;