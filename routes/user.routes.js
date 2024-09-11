const router = require("express").Router();
const User = require("../models/User.model")

router.post("/users", (req, res) => {
    User.create(req.body)
        .then((user) => {
            res.status(201).json(user);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({message: "Could not create a user."});
        })
})

router.get("/users", (req, res) => {
    User.find()
        .then((users) => {
            res.status(200).json(users);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({message: "Could not retrieve users."});
        })
})

router.get("/users/:userId", (req, res) => {
    const { userId } = req.params;
    User.findById(userId)
        .then((user) => {
            res.status(200).json(user);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({message: "Could not retrieve user."})
        })
})

router.put("users/:userId", (req, res) => {
    const { userId } = req.params;
    User.findByIdAndUpdate(userId)
        .then((user) => {
            res.status(202).json(user);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({message: "Could not update user."})
        })
})

router.delete("users/:userId", (req, res) => {
    const { userId } = req.params;
    User.findByIdAndDelete(userId)
        .then(() => {
            res.status(202).json({message: "User has been deleted."});
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({message: "Could not delete user."})
        })
})

module.exports = router