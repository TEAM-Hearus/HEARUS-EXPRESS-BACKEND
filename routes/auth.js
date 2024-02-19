const express = require('express');
const { verifyRefreshToken } = require('../middlewares/jwtToken');
const { signup, login, renewAccessToken } = require('../controllers/auth');

const router = express.Router();

router.post('/signup', signup);

router.get('/login', login);

router.get('/renewToken', verifyRefreshToken, renewAccessToken);

module.exports = router;