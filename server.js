const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Router = require('./router/index')
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({extended:true}))
app.set('view engine', 'ejs');
app.use(Router);
require('dotenv').config()

mongoose.connect(
  process.env.DB_URL,
  {
    useNewUrlParser: true,
  }
)

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function(){
  console.log("Connected successfully");
});

app.listen(process.env.PORT, ()=>{
  console.log("Server is running at port 8080");
})