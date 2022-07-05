const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const date = new Date();
const dateformat = date.toLocaleString();

const commentSchema = new Schema({
    contents: {
        type : String,
        required : true
    },
    author: {
        type : String,
        required : true
    },
    comment_date: {type: String, default: dateformat}
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
    board_date: {type: String, default: dateformat},
    comments: [commentSchema]
});
 
module.exports = mongoose.model('board', boardSchema);