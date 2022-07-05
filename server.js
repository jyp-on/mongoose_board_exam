const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Router = require('./router/index')
app.set('view engine', 'ejs');
app.use(express.json(), Router);

mongoose.connect(
  'mongodb+srv://okmlnsunok:jyp1234@cluster0.i8mgpkg.mongodb.net/?retryWrites=true&w=majority',
  {
    useNewUrlParser: true,
  }
)

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function(){
  console.log("Connected successfully");
});

app.listen(8080, ()=>{
  console.log("Server is running at port 8080");
})