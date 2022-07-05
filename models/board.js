const mongoose = require("mongoose");

const Schema = mongoose.Schema;
 
const commentSchema = new Schema({
    contents: String,
    author: String,
    comment_date: {type: Date, default: Date.now()}
})
 
const boardSchema = new Schema({
    title: String,
    contents: String,
    author: String,
    board_date: {type: Date, default: Date.now()},
    comments: [commentSchema]
});
 
module.exports = mongoose.model('board', boardSchema);