var express = require('express');
var router = express.Router();
var passport = require('passport');

//this will be landing page soon...
router.get('/', function (req, res) {
    res.redirect('/blogs');
});


module.exports = router;