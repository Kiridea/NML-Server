const router = require("express").Router();
const List = require("../models/List.model")

router.post("/lists", (req, res) => {
    List.create(req.body)
        .then((list) => {
            res.status(200).json(list);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({message: "Could not create a list."});
        })
})

router.get("/lists", (req, res) => {
    List.find()
        .then((lists) => {
            res.status(200).json(lists)
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({message: "Could not retrieve lists"});
        })
})

router.get("/lists/:listId", (req, res) => {
    const { listId } = req.params;
    List.findById(listId)
        .then((list) => {
            res.status(200).json(list);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({message: "Could not retrieve user."});
        })
})

router.put("/lists/:listId", (req, res) => {
    const { listId } = req.params;
    List.findByIdAndUpdate(listId)
        .then((list) => {
            res.status(202).json(list);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({message: "Could not update list."});
        })
})

router.delete("/lists/:listId", (req, res) => {
    const { listId } = req.params;
    List.findByIdAndDelete(listId)
        .then(() => {
            res.status(202).json({message: "List has been deleted."});
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({message: "Could not delete list."});
        })
})

module.exports = router