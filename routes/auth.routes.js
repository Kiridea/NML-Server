const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");

const { isAuthenticated } = require("../middleware/jwt.middleware.js");

const saltRounds = 10;

router.post("/signup", (req, res, next) => {
    const { email, password, username } = req.body;

    if (email === "") {
        res.status(400).json({message: "Please provide an email address."});
        return;
    }
    if (username === "") {
        res.status(400).json({message: "Please provide a username."});
        return;
    }
    if (password === "") {
        res.status(400).json({message: "Please provide a password."});
        return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
        res.status(400).json({ message: "Please, provide a valid email address." });
        return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[¡!#$%&,./:;¿?@^_~])[A-Za-z\d¡!#$%&,./:;¿?@^_~]{8,}$/;
    if (!passwordRegex.test(password)) {
        res.status(400).json({
            message:
            "The password must have at least 8 characters and contain at least a number, a lowercase, an uppercase and a special character."
        });
        return;
    }

    User.findById({username})
        .then((user) => {
            if(user) {
                res.status(400).json({message: "This username is not available."});
                return;
            }
        })
    User.findById({email})
        .then((user) => {
            if(user) {
                res.status(400).json({message: "A user with this email already exists."});
                return;
            }

            const salt = bcrypt.genSaltSync(saltRounds);
            const hashedPassword= bcrypt.hashSync(password, salt);

            return User.create({username, email, password: hashedPassword});
        })
        .then((createdUser) => {
            const { email, username, _id } = createdUser;
            const user = { email, username, _id };

            res.status(201).json({user: user});
        })
        .catch((err) => next(err));
})

const MAX_LOGIN_ATTEMPTS = 10;
const LOCK_TIME = 120 * 60 * 1000;
router.post("/login", (req, res, next) => {
    const { email, password } = req.body;

    if (email === "") {
        res.status(400).json({message: "Please provide an email address."});
        return;
    }
    if (password === "") {
        res.status(400).json({message: "Please provide a password."});
        return;
    }

    User.findOne({email})
        .then((user) => {
            if(!user) {
                res.status(401).json({message: "User not found."});
                return;
            }

            if(user.isLocked()) {
                return res.status(423).json({message: "Account locked. Please try again later."});
            }

            if(user.lockUntil !== null && Date.now() > user.lockUntil) {
                user.failedLoginAttempts = 0;
                user.lockUntil = null;
            }

            const passwordCorrect = bcrypt.compareSync(password, user.password);

            if(passwordCorrect) {
                const { _id, email, username } = user;
                user.failedLoginAttempts = 0;
                user.lockUntil = null;
                user.save();

                const payload = { _id, email, username};
                const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
                    algorithm: "HS256",
                    expiresIn: "6h"
                })
                
                return res.status(200).json({authToken: authToken})
            } else {
                res.status(401).json({message: "Email and/or password did not match. Please try again."});
                user.failedLoginAttempts += 1;

                if(user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
                    user.lockUntil = Date.now() + LOCK_TIME;
                }
            }
            user.save();

            if(user.isLocked()) {
                return res.status(423).json({message: "Account locked due to too many failed login attempts. Please try again later."})
            } else {
                return res.status(401).json({message: "Invalid username or password"});
            }
        })
        .catch((err) => next(err)); 
})

router.get("/verify", isAuthenticated, (req, res, next) => {
    res.status(200).json(req.payload);
})

module.exports = router