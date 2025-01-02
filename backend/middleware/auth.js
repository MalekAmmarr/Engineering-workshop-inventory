const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized: No token provided' });
        }

        const token = authHeader.split(' ')[1]; // Extract the token

        // Verify token using JWT_SECRET from the .env file
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user details to the request
        req.user = decoded;

        if (!req.user.role) {
            return res.status(403).json({ error: 'Forbidden: Role not defined' });
        }

        next(); // Pass control to the next middleware
    } catch (error) {
        console.error('Authentication error:', error.message);
        res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    }
};

// Export the function directly
module.exports = {authMiddleware};
