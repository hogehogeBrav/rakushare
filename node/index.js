"use strict"
const db = require("./settings/db.js");
const express = require('express');
const app = express();
const http_socket = require('http').Server(app);
const io_socket = require('socket.io')(http_socket);
const passport = require('passport');
const mysql = require('mysql2');

app.set('view engine', 'ejs');

app.use(express.static(__dirname + "/views" , {index: false}));
app.use(express.static(__dirname + "/public" , {index: false}));
app.use(express.static(__dirname + "/js" , {index: false}));
app.use(express.static(__dirname + "/css" , {index: false}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get('/', (req, res) => {
  res.render('index.ejs');
});

// ファイルアップロード
const multer = require('multer');
// const strage = multer.diskStorage({
//   destination: function(req, file, cb){
//     cb(null, __dirname + '/public/images/');
//   },
//   filename: function(req, file, cb){
//     cb(null, file.originalname);
//   }
// });
// const upload = multer({storage: strage});
const upload = multer({dest: __dirname + '/uploads/'});
app.post('/upload', upload.single('file'), (req, res) => {
  console.log(req.file);
  res.send('ok');
});

io_socket.on('connection', function(socket){
  console.log('connected');
  socket.on('c2s' , function(msg){
    io_socket.to(msg.auctionid).emit('s2c', msg);
  });
  socket.on('c2s-join', function(msg){
    console.log('c2s-join:' + msg.auctionid);
    socket.join(msg.auctionid);
  });
});


http_socket.listen(19000);