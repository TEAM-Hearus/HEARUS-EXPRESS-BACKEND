var express = require('express');
const { verifyAccessToken } = require('../middlewares/jwtToken');
const { renderLecture } = require('../controllers/lecture');
var router = express.Router();

router.get('/', verifyAccessToken, renderLecture);

module.exports = router;