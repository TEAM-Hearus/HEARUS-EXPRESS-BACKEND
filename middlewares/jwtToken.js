const jwt = require('jsonwebtoken');

exports.verifyAccessToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token)
        return res.status(401).json({ error: 'Access Denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        req.userID = decoded.userID;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid Token' });
    }
}

exports.verifyRefreshToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token)
        return res.status(401).json({ error: 'Access Denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        req.userID = decoded.userID;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid Token' });
    }
}