const express = require("express");
const router = express.Router();

const Board = require("../models/board");
const Comment = require("../models/comment")
const User = require("../models/user");

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

router.use(session({secret : '비밀코드', resave : true, saveUninitialized: false}));
router.use(passport.initialize());
router.use(passport.session());

router.use(function(req,res,next){
  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.currentUser = req.user;
  next();
});

/*회원가입 */
router.get('/register', (요청, 응답)=>{
  응답.render('register');
})

router.post("/register", (요청, 응답)=>{
  User.findOne({email:요청.body.email}).then((user)=>{
    if(user){ //이미 있는 유저면
      return 응답.status(400).json({email : "이미 가입한 유저입니다."})
    } else{
      const newUser = new User({
        userName: 요청.body.userName,
        email: 요청.body.email,
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
  usernameField: 'email', //input의 name이 뭔지.
  passwordField: 'password',
  session: true,
  passReqToCallback: false, //true로 바꾸면 fucntion에 req를 넣어서 아디, 비번 외에 정보를 받기 가능
}, function (입력한이메일, 입력한비번, done) {
  User.findOne({ email: 입력한이메일 }, function (에러, 결과) {
    if (에러) return done(에러)

    //일치하는 id가 없으면
    if (!결과) return done(null, false, { msg: '존재하지않는 아이디입니다.' })
    //일치하는 아디가 있고 패스워드도 같으면
    if (입력한비번 == 결과.password) {
      return done(null, 결과) //결과를 담아서 serializeUser로 넘김
    } else {
      return done(null, false, { msg: '비번틀렸어요' })
    }
  })
}));

passport.serializeUser(function(user, done){
  done(null, user.email); //id를 이용해서 세션을 저장시키는 코드
});

passport.deserializeUser(function(아이디, done){
  User.findOne({email:아이디}, function(에러, 결과){
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
router.get('/logout', function(요청, 응답) {
  요청.logout();
  응답.redirect('/');
});

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
    응답.render("edit", {board:결과});
  })
})

router.put('/board/edit', function(요청, 응답){
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
      응답.redirect('/');
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
  const date = new Date();
  const dateformat = date.toLocaleString();

  let comment = new Comment();
  comment.contents = 요청.body.contents;
  comment.author = 요청.body.author;
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

module.exports = router