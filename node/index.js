"use strict"
require('dotenv').config();
const db = require("./settings/db.js");
const express = require('express');
const app = express();
const http_socket = require('http').Server(app);
const io_socket = require('socket.io')(http_socket);
const passport = require('passport');
const mysql = require('mysql2');
const aws = require('aws-sdk');
const fs = require('fs');

app.set('view engine', 'ejs');

const s3 = new aws.S3({
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	region: process.env.AWS_REGION,
	signatureVersion: 'v4'
});

app.use(express.static(__dirname + "/views" , {index: false}));
app.use(express.static(__dirname + "/public" , {index: false}));
app.use(express.static(__dirname + "/js" , {index: false}));
app.use(express.static(__dirname + "/css" , {index: false}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// ホーム画面
app.get('/', (req, res) => {
  res.render('index.ejs');
});

app.get('/upload', (req, res) => {
  res.render('upload.ejs');
});

// ファイルアップロード
const multer = require('multer');
const multerS3 = require('multer-s3');

// multer-s3の公式を参照（下記）
const upload = multer({
  storage: multerS3({
    s3: s3,
    ACL: 'public-read',
    bucket: 'rakushare',
    metadata: function (req, file, cb) {
      cb(null, {fieldName: file.fieldname});
    },
    key: function (req, file, cb) {
      cb(null, "testuser" + "/" + Buffer.from(file.originalname, 'latin1').toString('utf8',))
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
  })
});

// Create images
// upload(...)で画像を登録。multer公式参照（下記）
app.post('/upload', upload.single('file'), (req, res, next) => {
  if (req.file) {
    console.log('Image uploaded!');
    // res.redirect('/images');
    res.send('ok');
  }
  else {
    console.log('Image can not uploaded!')
    // res.render('image.ejs');
    res.send('ok');
  }
})


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