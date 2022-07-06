const express = require("express");
const router = express.Router();

const Board = require("../models/board");
const Comment = require("../models/comment")


/* index -> 게시판 보여주는 곳 */
router.get('/', function(요청, 응답){
  Board.find({}, function(에러, 결과){
    응답.render('index', {board:결과})
  })
})

/* Write board page */
router.get('/write', function(요청, 응답) {
  응답.render('write');
});

/* board insert mongo */
router.post('/board/write', function (요청, 응답) {
let board = new Board();
board.title = 요청.body.title;
board.contents = 요청.body.contents;
board.author = 요청.body.author;

board.save(function (err) {
  if(err){
    console.log(err);
    응답.redirect('/');
  }
  응답.redirect('/');
});
});

/* board find by id */
router.get('/detail/:id', function (요청, 응답) {
  Board.findOne({_id: 요청.params.id}, function (err, board) {
      if(err){console.log(err)}
      응답.render('detail', { board: board });
  })
});

/* comment insert mongo*/
router.post('/comment/write', function (요청, 응답){
  var comment = new Comment();
  comment.contents = 요청.body.contents;
  comment.author = 요청.body.author;

  Board.findOneAndUpdate({_id : 요청.body.id}, 
    { $push: { comments : comment}}, function (err, board) {
      if(err){
          console.log(err);
          응답.redirect('/');
      }
      응답.redirect('/board/'+요청.body.id);
  });
});

module.exports = router