'use strict';

var express = require('express');
var controller = require('./generate.controller');

var router = express.Router();

router.post('/', controller.generateForm);

module.exports = router;
