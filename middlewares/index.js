const { User } = require("../models");

const checkIfAuthenticated = async function(req, res, next) {
    // Check if the request is an OPTIONS preflight request
    if (req.method === 'OPTIONS') {
        // Preflight requests are used by browsers to check CORS policies
        // Allow these requests to pass without authentication checks
        return next();
    }

    if (req.session.userId) {
        // If the user is authenticated, fetch user data if not already available in session
        if (!req.session.user) {
            try {
                const user = await User.where({ id: req.session.userId }).fetch({ required: true });
                const userData = user.toJSON();
                req.session.user = {
                    username: userData.userName,
                    email: userData.email
                };
            } catch (error) {
                // Handle error if user data fetching fails
                console.error("Error fetching user data:", error);
                req.flash('error_messages', "Error fetching user data");
                return res.redirect('/users/login');
            }
        }
        // Proceed to the next middleware or route handler
        return next();
    } else {
        // If the user is not authenticated, redirect to the login page
        req.flash('error_messages', "You must be logged in to view this page");
        return res.redirect('/users/login');
    }
};

module.exports = {
    checkIfAuthenticated
};
