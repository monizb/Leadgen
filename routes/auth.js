//create auth route
const express = require('express');
const router = express.Router();
const User = require('../models/user');


router.post('/signup', (req, res) => {
    const { name, email } = req.body;
    User.findOne({ email: email }, (err, user) => {
        if (err) {
            res.status(500).json({
                error: err
            });
        } else if (user) {
            res.status(400).json({
                error: "User already exists"
            });
        } else {
            const newUser = new User({
                name: name,
                email: email
            });
            newUser.save(newUser, (err, user) => {
                if (err) {
                    res.status(500).json({
                        error: err
                    });
                } else {
                    res.status(201).json({
                        message: "User created",
                        action: "signup",
                        next: "verify",
                        step: "Check your email for OTP and call the verify otp route to generate your API key",
                        user: user
                    });
                }
            });
        }
    });
});


//verify otp and generate api key
router.post('/verify', (req, res) => {
    const { email, otp } = req.body;
    User.findOne({ email: email }, (err, user) => {
        if (err) {
            res.status(500).json({
                error: err
            });
        } else if (!user) {
            res.status(400).json({
                error: "User does not exist"
            });
        } else {
            if (!user.verified) {
                if (user.otp === otp) {
                    user.verified = true;
                    //generate a 20 character api key
                    user.apiKey = Math.random().toString(36).substring(2, 22) + Math.random().toString(36).substring(2, 22);
                    user.save(user, (err, user) => {
                        if (err) {
                            res.status(500).json({
                                error: err
                            });
                        } else {
                            res.status(200).json({
                                message: "User verified",
                                action: "verify",
                                next: "login",
                                step: "Login with your email and password",
                                user: user
                            });
                        }
                    });
                } else {
                    res.status(400).json({
                        error: "OTP does not match"
                    });
                }
            } else {
                res.status(400).json({
                    error: "User already verified"
                });
            }
        }
    });
});



//resend otp
router.post('/resendotp', (req, res) => {
    const { email } = req.body;
    User.findOne({ email: email }, (err, user) => {
        if (err) {
            res.status(500).json({
                error: err
            });
        } else if (!user) {
            res.status(400).json({
                error: "User does not exist"
            });
        } else {
            if (!user.verified) {
                user.otp = Math.floor(100000 + Math.random() * 900000);
                user.save(user, (err, user) => {
                    if (err) {
                        res.status(500).json({
                            error: err
                        });
                    } else {
                        res.status(200).json({
                            message: "OTP resent",
                            action: "resendotp",
                            next: "verify",
                            step: "Check your email for OTP and call the verify otp route to generate your API key",
                            user: user
                        });
                    }
                });
            } else {
                res.status(400).json({
                    error: "User already verified"
                });
            }
        }
    });
});



router.post('/login', (req, res) => {
    user.findOne({
        email: req.body.email
    }).then(user => {
        if (user) {
            if (user.otp == req.body.otp) {
                res.send({
                    message: 'Login Successful',
                    user: user
                });
            } else {
                res.send({
                    message: 'Incorrect OTP'
                });
            }
        } else {
            res.send({
                message: 'User not found'
            });
        }
    }).catch(err => {
        res.send({
            message: 'Error occured'
        });
    });
});

module.exports = router;