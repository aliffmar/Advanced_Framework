const checkIfAuthenticated = function(req, res, next) {
    // Check if the request is an OPTIONS preflight request
    if (req.method === 'OPTIONS') {
        // Preflight requests are used by browsers to check CORS policies
        // Allow these requests to pass without authentication checks
        return next();
    }

    // Always proceed to the next middleware or route handler
    return next();
};

module.exports = {
    checkIfAuthenticated
};