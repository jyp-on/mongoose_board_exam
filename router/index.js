const express = require("express");
const router = express.Router();

const Board = require("../models/board");
const Comment = require("../models/comment")
const User = require("../models/user");

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const bcrypt = require('bcryptjs');

router.use(session({secret : '비밀코드', resave : true, saveUninitialized: false}));
router.use(passport.initialize());
router.use(passport.session());


/**모든 페이지요청이 있을때마다 로그인 여부 반환 */
router.use(function(req,res,next){
  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.currentUser = req.user;
  next();
});

/*회원가입 */
router.get('/register', (요청, 응답)=>{
  응답.render('register', {msg:'기본'});
})

router.post("/register", (요청, 응답)=>{
  User.findOne({userName:요청.body.userName}).then((user)=>{
    if(user){ //이미 있는 유저면
      응답.render('register',{msg:'사용중인 닉네임 입니다.'});
    } else{
      const newUser = new User({
        userName: 요청.body.userName,
        password: 요청.body.password,
      });
      newUser.save(function(에러){
        if(에러) {console.log(에러)}
        응답.redirect('/');
      })
      // return 응답.status(200).json({msg: newUser})
    }
  })
})


router.post('/check', (요청, 응답)=>{
  const name = 요청.body.name;
  let msg;
  User.findOne({userName:name}).then((user)=>{
    if(user){//유저가 있으면
      msg = 1 //
    }
    else {msg = 2} //사용가능한 닉네임일때
    응답.send({msg:msg})
  })
  
  
})

/*로그인 */
router.get('/login', (요청, 응답)=>{
  응답.render('login', {msg:1});
})

router.post('/login', passport.authenticate('local', {
  failureRedirect : '/fail'
}),function(요청, 응답){
  응답.redirect('/')
});

router.get('/fail', function(요청, 응답){
  응답.render('login', {msg:'로그인 실패'})
})

passport.use(new LocalStrategy({ //인증하는 방법
  usernameField: 'userName', //input의 name이 뭔지.
  passwordField: 'password',
  session: true,
  passReqToCallback: false, //true로 바꾸면 fucntion에 req를 넣어서 아디, 비번 외에 정보를 받기 가능
}, function (입력한이름, 입력한비번, done) {
  
  User.findOne({ userName: 입력한이름 }, function (에러, 결과) {
    if (에러) return done(에러)

    //일치하는 id가 없으면
    if (!결과) return done(null, false, { msg: '존재하지않는 아이디입니다.' })
    //일치하는 아디가 있고 패스워드도 같으면
    const validPassword = bcrypt.compare(입력한비번, 결과.password)
    if (validPassword) {
      return done(null, 결과) //결과를 담아서 serializeUser로 넘김
    } else {
      return done(null, false, { msg: '비번틀렸어요' })
    }
  })
}));

passport.serializeUser(function(user, done){
  done(null, user.userName); //id를 이용해서 세션을 저장시키는 코드
});

passport.deserializeUser(function(아이디, done){
  User.findOne({userName:아이디}, function(에러, 결과){
    done(null, 결과)
  })
})

/*로그인 여부 체크하는 미들웨어 함수*/
function 로그인여부(요청, 응답, next){
  if(요청.user){ 
    next()
  } else{
    응답.redirect('/login')
  }
}

/* 로그아웃 */
router.get('/logout', function(요청, 응답, next) {
  요청.logout(function(에러){
    if(에러) {return next(err);}
    응답.redirect('/');
  })
});



/**ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ */
/**ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ로그인 회원가입 끝 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ*/
/**ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ */

/* index -> 게시판 보여주는 곳 */
router.get('/', function(요청, 응답){
  const page = Number(요청.query.page || 1);
  const perPage = Number(5);
  let total;
  let totalPage;
  Board.count({}, function(err, count){
    total = count
    totalPage = Number(Math.ceil(total/perPage));

    Board.find({}, function(에러, 결과){
      응답.render('index', {board:결과, totalPage:totalPage})
    }).sort({board_date:-1}).skip(perPage * (page-1)).limit(perPage);
  })
})


router.get('/search', (요청, 응답)=>{
  let 검색조건 = [
    {
      $search: {
        index: 'search',
        text: {
          query: 요청.query.title,
          path: 'title'
        }
      }
    }
  ]

  const page = Number(요청.query.page || 1);
  const perPage = Number(5);
  let total;
  let totalPage;

  Board.aggregate(검색조건, function(에러, 결과){
    total = 결과.length 
    totalPage = Number(Math.ceil(total/perPage));
    console.log(totalPage)
    응답.render('index', {board:결과,totalPage:totalPage})
  }).sort({board_date:-1}).skip(perPage * (page-1)).limit(perPage);
})

/* Write board page */
router.get('/board/write',로그인여부, function(요청, 응답) {
  응답.render('write');
});

/* board insert mongo */
router.post('/board/write',로그인여부, function(요청, 응답) {
  const date = new Date();
  const dateformat = date.toLocaleString();

  let board = new Board();
  board.title = 요청.body.title;
  board.contents = 요청.body.contents;
  board.author = 요청.user.userName;
  board.board_date = dateformat;

  board.save(function (에러) {
    if(에러){
      console.log(에러);
      응답.redirect('/');
    }
    응답.redirect('/');
  });
});

router.delete('/board/delete',로그인여부,  function(요청, 응답){
   Board.deleteOne({_id:요청.body.id}, 
    function(에러){
    if(에러){
      console.log(에러)
    }
    응답.redirect('/');
  })
});

router.get('/board/edit/:id',로그인여부, function(요청, 응답){
  Board.findOne({_id:요청.params.id}, function(에러, 결과){
    if(에러){console.log(에러)}
    응답.render("edit", {board:결과});
  })
})

router.put('/board/edit',로그인여부, function(요청, 응답){
  const contents = 요청.body.contents
  const title = 요청.body.title
  Board.findOneAndUpdate({_id:요청.body.id}, 
    { $set: {
      contents : contents,
      title : title
    }}, function(에러, 결과){
      if(에러){
        console.log(에러);
        응답.redirect('/detail/'+요청.body.id);
      }
      응답.redirect('/detail/'+요청.body.id);
    })
})

/* board find by id */
router.get('/detail/:id',로그인여부, function (요청, 응답) {
  Board.findOne({_id: 요청.params.id}, function (err, board) {
      if(err){console.log(err)}
      응답.render('detail', { board: board });
  });
});

/* comment insert mongo*/
router.post('/comment/write',로그인여부, function (요청, 응답){
  const date = new Date();
  const dateformat = date.toLocaleString();

  let comment = new Comment();
  comment.contents = 요청.body.contents;
  comment.author = 요청.user.userName;
  comment.comment_date = dateformat;
  Board.findOneAndUpdate({_id : 요청.body.id}, 
    { $push: { comments : comment}}, function (에러, 결과) {
      if(에러){
          console.log(에러);
          응답.redirect('/detail/'+요청.body.id);
      }
      응답.redirect('/detail/'+요청.body.id);
  });
});

/* comment delete mongo*/
router.delete('/comment/delete',로그인여부, function (요청, 응답){
  let c_id = 요청.body.c_index;
  Board.findOneAndUpdate({_id:요청.body.id},
    { $pull: {comments:{_id:c_id}}}).exec()
  
  응답.redirect('/detail/'+요청.body.id)
});


module.exports = router