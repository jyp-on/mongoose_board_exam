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
router.get('/board/write', function(요청, 응답) {
  응답.render('write');
});

/* board insert mongo */
router.post('/board/write', function (요청, 응답) {
  let board = new Board();
  board.title = 요청.body.title;
  board.contents = 요청.body.contents;
  board.author = 요청.body.author;

  board.save(function (에러) {
    if(에러){
      console.log(에러);
      응답.redirect('/');
    }
    응답.redirect('/');
  });
});

router.delete('/board/delete',  function(요청, 응답){
   Board.deleteOne({_id:요청.body.id}, 
    function(에러){
    if(에러){
      console.log(에러)
    }
    응답.redirect('/');
  })
});

router.get('/board/edit/:id', function(요청, 응답){
  Board.findOne({_id:요청.params.id}, function(에러, 결과){
    if(에러){console.log(에러)}
    응답.render("edit", 결과);
  })
})

router.put('/board/edit', function(요청, 읃답){
  const contents = 요청.body.contents
  const title = 요청.body.title
  Board.findOneAndUpdate({_id:요청.body.id}, 
    { $set: {
      contents : contents,
      title : title
    }}, function(에러, 결과){
      if(에러){
        console.log(에러);
        응답.redirect('/');
      }
    })
})

/* board find by id */
router.get('/detail/:id', function (요청, 응답) {
  Board.findOne({_id: 요청.params.id}, function (err, board) {
      if(err){console.log(err)}
      응답.render('detail', { board: board });
  })
});

/* comment insert mongo*/
router.post('/comment/write', function (요청, 응답){
  let comment = new Comment();
  comment.contents = 요청.body.contents;
  comment.author = 요청.body.author;
  console.log(comment)
  Board.findOneAndUpdate({_id : 요청.body.id}, 
    { $push: { comments : comment}}, function (에러, 결과) {
      if(에러){
          console.log(에러);
          응답.redirect('/');
      }
      응답.redirect('/detail/'+요청.body.id);
  });
});

module.exports = router