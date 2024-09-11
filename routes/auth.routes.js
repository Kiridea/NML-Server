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


module.exports = router