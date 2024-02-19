exports.renderLecture = (req, res) => {
    res.locals.userID = req.userID;
    res.render('lecture');
};