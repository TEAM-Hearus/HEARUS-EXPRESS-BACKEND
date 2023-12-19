var express = require('express');
const {
  renderIndex
} = require('../controllers/index');
var router = express.Router();

router.get('/', renderIndex);

module.exports = router;