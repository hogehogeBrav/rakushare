"use strict"
require('dotenv').config();
const db = require("./settings/db.js");
const express = require('express');
const app = express();
const http_socket = require('http').Server(app);
const io_socket = require('socket.io')(http_socket);
// const passport = require('passport');
const cron = require('node-cron');
const mysql = require('mysql2');
const aws = require('aws-sdk');
const bcrypt = require('bcrypt');
const cookie = require('cookie-parser');
const QRCode = require('qrcode');
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
app.use(cookie());

// ホーム画面
app.get('/', (req, res) => {
  // 初回アクセス時
  if (req.cookies.name === undefined) {
    let gen_name = Math.random().toString(36).slice(-8);
    // DBに登録されているユーザー名を取得
    connection.query('SELECT * FROM users WHERE user_name = "' + gen_name + '";', function (error, results, fields) {
      if (error) throw error;
      const count = results.length;
      console.log(count);
      // ユーザー名が登録されていない
      if (count == 0) {
        // ユーザー名をDBに保存
        connection.query('INSERT INTO users (user_name, is_delete) VALUES (?, ?);',
        [gen_name, false],
        (error, results, fields) => {
          if (error) throw error;
          console.log('The solution is: ', results);
        });
        // ユーザー名をクッキーに保存
        // 有効期限は1週間
        res.cookie('name', gen_name, { maxAge: 604800000, httpOnly: true });
        res.render("index", { user_name: gen_name, toast: 0 });
      }
    });
  } else {
    res.cookie('name', req.cookies.name, { maxAge: 604800000, httpOnly: true });
    res.render("index", { user_name: req.cookies.name, toast: 0 });
  }
});

app.post('/upload',(req, res) => {
  connection.query('SELECT * FROM users WHERE user_name = "' + req.cookies.name + '";',
    (error, results, fields) => {
    if (error) throw error;
    const count = results.length;
    // ユーザー名が登録されていない
    if (count == 0) {
      res.render("index", {
        user_name: req.cookies.name,
        torst: 4
      });
    } else {
      let chkflg = true;
      // // 入力値チェック
      if(req.body.folder_name == "" || req.body.passkey == ""){
        chkflg = false;
        res.render('index.ejs', {
          user_name: req.cookies.name,
          torst: 2,
        });
      } else if(check(req.body.passkey)){
        chkflg = false;
        res.render('index.ejs', {
          user_name: req.cookies.name,
          toast: 3,
        });
      }
      console.log(req.body);
    
      // 入力チェックOK
      if(chkflg){
        const saltRounds = 10
        const hash = bcrypt.hashSync(req.body.passkey, saltRounds);
        console.log(bcrypt.compareSync(req.body.passkey, hash));
    
        // DB重複チェック
        connection.query(`SELECT * 
                          FROM folder 
                          INNER JOIN users
                          ON folder.user = users.ID
                          WHERE folder_name = ? AND user_name = ?;`,
          [req.body.folder_name, req.cookies.name], function (error, results, fields) {
          if (error) throw error;
          const count = results.length;
          console.log(count);
          // フォルダ名重複
          if (count > 0) {
            res.render('index.ejs', {
              user_name: req.cookies.name,
              toast: 1,
            });
          } else {
            // DB 登録
            connection.query(
              `INSERT INTO folder (user, folder_name, passkey, state) 
              VALUES ((SELECT id FROM users WHERE user_name = ?), ?, ?, ?)`,
              [req.cookies.name ,req.body.folder_name, hash, 0],
              (error, results, fields) => {
                if (error) throw error;
                console.log('The solution is: ', results);
              }
            );

            const share_url = '/share/' + req.cookies.name + '/' + req.body.folder_name + '?k=' + hash;

            QRCode.toDataURL(share_url, (error, url) => {
              if (error) {
                console.log(error);
                return;
              }
              res.render('upload.ejs', {
                user_name: req.cookies.name,
                share_url: share_url,
                qr_url: url,
                folder_name: req.body.folder_name,
              });
            });
          }
        });
      }
    }
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
      cb(null, "share_folder/" + req.cookies.name + "/" + req.query.folder_name + "/" + Buffer.from(file.originalname, 'latin1').toString('utf8',))
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

app.delete('/upload', (req, res, next) => {
  // S3からファイル削除
  s3.deleteObject({
    Bucket: 'rakushare',
    Key: "share_folder/" + req.cookies.name + "/" + req.body.folder_name + "/" + req.body.file_name,
  }, function(err, data) {
    if (err) {
      console.log(err);
    } else {
      console.log(data);
    }
  });
});

// ルームリスト（フォルダ一覧）
app.get('/room_list', (req, res) => {
  connection.query(`SELECT * FROM folder WHERE user = (SELECT id FROM users WHERE user_name = ?);`,
    [req.cookies.name], function (error, results, fields) {
    if (error) throw error;
    console.log(results);
    res.render('room_list.ejs', {
      user_name: req.cookies.name,
      room_list: results,
    });
  });
});

// ユーザ名変更
app.post('/user_name', (req, res) => {
  // ユーザー名入力値チェック
  if(usernameCheck(req.body.user_name)){
    if(usernameCheck(req.body.user_name) == 1){
      res.render('index.ejs', {
        user_name: req.cookies.name,
        toast: 5,
      });
    } else if(usernameCheck(req.body.user_name) == 2){
      res.render('index.ejs', {
        user_name: req.cookies.name,
        toast: 6,
      });
    } else if(usernameCheck(req.body.user_name) == 3){
      res.render('index.ejs', {
        user_name: req.cookies.name,
        toast: 7,
      });
    }
    return;
  }
  // ユーザー名重複チェック
  connection.query(`SELECT * FROM users WHERE user_name = ?;`,
  [req.body.user_name],
  function (error, results, fields) {
    if (error) throw error;
    const count = results.length;
    console.log(count);
    // ユーザー名重複
    if (count > 0) {
      res.render('index.ejs', {
        user_name: req.cookies.name,
        toast: 8,
      });
      return;
    } else {
      // ユーザー名をDBに保存
      connection.query('UPDATE users SET user_name = ?, add_date = NOW() WHERE user_name = ?',
      [req.body.user_name, req.cookies.name],
      (error, results, fields) => {
        if (error) throw error;
        console.log('The solution is: ', results);
      });
      // ユーザー名をクッキーに保存
      res.cookie('name', req.body.user_name, { maxAge: 604800000, httpOnly: true });
      res.render("index", { user_name: req.body.user_name, toast: 9 });
    }
  });
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

// ユーザーcron
// cron.schedule('*/1 * * * *', () => {
//   console.log('cron');
//   connection.query('DELETE ', function (error, results, fields) {

// 関数群
// function usernameCheck(req, res, next) {
//   connection.query('SELECT * FROM users WHERE name = "' + req.cookies.name + '";',
//     (error, results, fields) => {
//     if (error) throw error;
//     const count = results.length;
//     // ユーザー名が登録されていない
//     if (count == 0) {
//       return false;
//     } else {
//       res.render("index", {
//         user_name: req.cookies.name,
//         upload_error: 4
//       });
//     }
//   });
// }

function check(str) {
  // 半角英数字チェック
  if (str.match(/[^A-Za-z0-9]+/)) {
    return true;
  } else {
      //半角英数字
    return false;
  }
}

// ユーザ名チェック
function usernameCheck(str){
  console.log(str.length);
  switch(true){
    // ユーザー名が空の場合
    case str == "":
      return 1;
    // ユーザー名が20文字以上の場合
    case str.length > 20:
      return 2;
    // ユーザー名が半角英数字以外の場合
    case !str.match(/^[a-zA-Z0-9]+$/):
      return 3;
    default:
      return 0;
  }
}

http_socket.listen(19000);