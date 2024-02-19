const express = require('express');
const { verifyToken } = require('../middlewares/jwtToken');
const { signup, login, renewAccessToken } = require('../controllers/auth');

const router = express.Router();

router.post('/signup', signup);

router.post('/login', login);

router.post('/renewToken', verifyToken, renewAccessToken);

module.exports = router;