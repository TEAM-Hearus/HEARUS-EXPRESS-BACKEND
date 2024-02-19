const bycrpt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.signup = async (req, res, next) => {
    // Destructure req.body
    const {
        name, email, password, isOAuth, OAuthType,
        school, major, grade, savedLectures, usePurpose,
    } = req.body;

    try {
        const exUser = await User.findOne({ email: email });
        if (exUser)
            return res.status(409).json({ status: "fail", message: "User already exists" });

        // Hash password
        const salt = await bycrpt.genSalt(10);
        const hashedPW = await bycrpt.hash(password, salt);

        // Save newUser
        const newUser = new User({
            name, email, password: hashedPW, isOAuth, OAuthType,
            school, major, grade, savedLectures, usePurpose,
        });
        await newUser.save();

        return res.status(201).json({ status: "success", message: "Signup success" });
    } catch (error) {
        console.error(error);
        return next(error);
    }

}

exports.login = async (req, res, next) => {
    // Destructure req.body
    const {
        email, password, isOAuth, OAuthType,
    } = req.body;

    // OAuth
    if (isOAuth)
        return res.status(405).json({ status: "fail", message: "OAuth not implemented" });

    try {
        // Find User
        const exUser = await User.findOne({ email: email });
        if (!exUser)
            return res.status(401).json({ status: "fail", message: "Unknown user" });

        // Match password
        const matchPW = await bycrpt.compare(password, exUser.password);
        if (!matchPW)
            return res.status(401).json({ status: "fail", message: "Wrong password" });

        // Certify Tokens
        const accessToken = jwt.sign({ userID: exUser._id }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });
        const refreshToken = jwt.sign({ userID: exUser._id }, process.env.JWT_SECRET, {
            expiresIn: '24h',
        });

        return res.status(201).json({
            status: "success",
            message: "Login success",
            accessToken: accessToken,
            refreshToken: refreshToken,
        });
    } catch (error) {
        console.error(error);
        return next(error);
    }
}

exports.renewAccessToken = async (req, res, next) => {
    try {
        // Renew Access Token
        const accessToken = jwt.sign({ userID: req.userID }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        return res.status(201).json({
            status: "success",
            message: "Renew Access Token",
            accessToken: accessToken,
        });
    } catch (error) {
        console.error(error);
        return next(error);
    }
}