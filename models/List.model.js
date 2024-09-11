const { Schema, model } = require("mongoose");
const User = require("./User.model")

const listSchema = new Schema (
    {
        displayName: {
            type: String,
            default: User.username
        },
        imageUrl: {
            type: String
        },
        links: {
            type: [String]
        }
    }
)

const List = model("List", listSchema)

module.exports = List