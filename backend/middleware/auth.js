const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Malformed token' });
    }

    console.log("Token received:", token);
    try {
        const decoded = jwt.verify(token, process.env.JSON_WEB_TOKEN_SECRET);
        console.log("Token verified:", decoded);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
}

module.exports = authenticateToken;
