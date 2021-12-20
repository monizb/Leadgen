//verify api key middleware
const User = require("../models/user")

var verifyAPIKey = function (req, res, next) {
    const apiKey = req.query.apiKey;
    User.findOne({ apiKey: apiKey }, (err, user) => {
        if (err) {
            res.status(500).json({
                error: err
            });
        } else if (!user) {
            res.status(400).json({
                error: "User does not exist"
            });
        } else {
            if (user.verified) {
                res.locals.user = user;
                next();
            } else {
                res.status(400).json({
                    error: "User not verified"
                });
            }
        }
    });
}

module.exports = verifyAPIKey;

