const mongoose = require('mongoose')
const Schema = mongoose.Schema
const AnswerSchema = new Schema({
   
    text: {
        type: String,
        required: true
    },
    date: {
        type: String
    }
})

const Answer= mongoose.model('answers', AnswerSchema)
module.exports = Answer