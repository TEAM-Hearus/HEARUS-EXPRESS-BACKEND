const { verifyToken } = require('../middlewares/jwtToken');
var express = require('express');

const {
    renderLecture
} = require('../controllers/lecture');
var router = express.Router();

router.get('/', verifyToken, renderLecture);

module.exports = router;