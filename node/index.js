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
const bcrypt = require('bcrypt');
const fs = require('fs');

app.set('view engine', 'ejs');

// // AWS RDS
// const connection = mysql.createConnection({
//   host: process.env.AWS_RDS_HOST,
//   user: process.env.AWS_RDS_USER,
//   password: process.env.AWS_RDS_PASSWORD,
//   database: process.env.AWS_RDS_DB,
//   port: process.env.AWS_RDS_PORT
// });

// local DB
const connection = mysql.createConnection({
  host: process.env.LOCAL_DB_HOST,
  user: process.env.LOCAL_DB_USER,
  password: process.env.LOCAL_DB_PASSWORD,
  database: process.env.LOCAL_DB_DB,
  port: process.env.LOCAL_DB_PORT
});

connection.connect(function(err) {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }
  console.log('Connected to database.');
});

// AWS S3
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

app.post('/upload', (req, res) => {
  console.log(req.query);
  // bcrypt
  const saltRounds = 10
  const hash = bcrypt.hashSync(req.body.passkey, saltRounds);
  console.log(bcrypt.compareSync(req.body.passkey, hash));

  console.log(hash);
  res.render('upload.ejs', {
    folder_name: req.body.folder_name,
  });
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
      console.log(req);
      cb(null, req.query.folder_name + "/" + Buffer.from(file.originalname, 'latin1').toString('utf8',))
    },
  })
});

// Create images
// upload(...)で画像を登録。multer公式参照（下記）
app.put('/upload', upload.single('file'), (req, res, next) => {
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