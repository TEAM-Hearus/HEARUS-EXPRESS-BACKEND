const bycrpt = require('bcrypt');
const User = require('../models/user');

exports.signup = async (req, res, next) => {
    // destructure req.body
    const {
        name, email, password, isOAuth, OAuthType,
        school, major, grade, savedLectures, usePurpose,
    } = req.body;

    try {
        const exUser = await User.findOne({ email: email });
        if (exUser)
            return res.redirect('/join?error=userAlreadyExists');

        // hash password
        const salt = await bycrpt.genSalt(10);
        const hashedPW = await bycrpt.hash(password, salt);

        // save newUser
        const newUser = new User({
            name, email, hashedPW, isOAuth, OAuthType,
            school, major, grade, savedLectures, usePurpose,
        });
        await newUser.save();

        res.status(201).json({ status: "success", message: "Signup success" })
    } catch (error) {
        console.error(error);
        return next(error);
    }

}