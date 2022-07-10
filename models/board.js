const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const commentSchema = new Schema({
    contents: {
        type : String,
        required : true
    },
    author: {
        type : String,
        required : true
    },
    comment_date: {type: String, required: true}
})
 
const boardSchema = new Schema({
    title: {
        type : String,
        required : true
    },
    contents: {
        type : String,
        required : true
    },
    author: {
        type : String,
        required : true
    },
    board_date: {type: String, required: true},
    comments: [commentSchema]
});
 

module.exports = mongoose.model('board', boardSchema);