const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

const UserSchema = new Schema({
    userName: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

// Mongoose의 pre메소드는 `Register Controller`의 save메소드가 실행되기 전에 실행된다.
// save되기 전에 Hashing을 하기 위해 pre메소드 내부에 Hash Function 작성
UserSchema.pre("save", function (next) {
    const user = this; // userSchema를 가르킴
  
    if (user.isModified('password')) {
      // password가 변경될 때만 Hashing 실행
      // genSalt: salt 생성
      bcrypt.genSalt(10, function (err, salt) {
        if (err) return next(err);
        bcrypt.hash(user.password, salt, function (err, hashedPassword) {
          // hash의 첫번째 인자: 비밀번호의 Plain Text
          if (err) return next(err);
          user.password = hashedPassword; // 에러없이 성공하면 비밀번호의 Plain Text를 hashedPassword로 교체해줌
          next(); // Hashing이 끝나면 save로 넘어감
        })
      })
    } else {
      // password가 변경되지 않을 때
      next(); // 바로 save로 넘어감
    }
  })
 
module.exports = mongoose.model('User', UserSchema);