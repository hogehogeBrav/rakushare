"use strict"
require('dotenv').config();
const db = require("./settings/db.js");
const express = require('express');
const app = express();
const fs = require('fs');
const mysql = require('mysql2');
const aws = require('aws-sdk');
const bcrypt = require('bcrypt');
const cookie = require('cookie-parser');
const QRCode = require('qrcode');
const cron = require('node-cron');

// http, httpsの設定
// const http_socket = require('https').Server(app);
const https = require('https').createServer({
  key: fs.readFileSync('./pem/privkey.pem'),
  cert: fs.readFileSync('./pem/cert.pem'),
}, app)

app.set('view engine', 'ejs');

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
            // 今の時刻から3日後
            const delete_date = new Date();
            delete_date.setDate(delete_date.getDate() + 3);

            // DBにフォルダ情報を保存
            connection.query(
              `INSERT INTO folder (user, folder_name, passkey, state, delete_date) 
              VALUES ((SELECT id FROM users WHERE user_name = ?), ?, ?, ?, ?)`,
              [req.cookies.name ,req.body.folder_name, hash, 0, delete_date],
              (error, results, fields) => {
                if (error) throw error;
                console.log('The solution is: ', results);
              }
            );

            const share_url = 'https://rakushare.bounceme.net/share/' + req.cookies.name + '/' + req.body.folder_name + '?k=' + hash;

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
    bucket: process.env.AWS_BUCKET_NAME,
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
      res.status(200).send();
    }
  });
});

// QRコード読み込み
app.get('/qr', (req, res) => {
  res.render('qr.ejs', {
    user_name: req.cookies.name,
  });
});

// ファイル共有リンク
app.get('/share/:user_name/:folder_name', (req, res) => {
  connection.query(`SELECT *
                    FROM folder
                    INNER JOIN users
                    ON folder.user = users.ID
                    WHERE folder_name = ? AND user_name = ?;`,
    [req.params.folder_name, req.params.user_name], function (error, results, fields) {
    if (error) throw error;
    if(results.length > 0){
      if(req.query.k != results[0].passkey){
        res.render('index.ejs', {
          user_name: req.cookies.name,
          toast: 10,
        });
      } else {
        var params = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Prefix: "share_folder/" + req.params.user_name + "/" + req.params.folder_name + "/",
        };
        s3.listObjects(params, function (err, data) {
          if (err) console.log(err, err.stack);
          else {
            console.log(data);
            let url = [];
            let file_name = [];
            let file_size = [];
            for (let i = 0; i < data.Contents.length; i++) {
              url.push(s3.getSignedUrl('getObject', {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: data.Contents[i].Key,
                Expires: 60 * 60 * 24 * 7,
              }));
            }

            // ファイル名を取得
            for (let i = 0; i < data.Contents.length; i++) {
              file_name.push(data.Contents[i].Key.replace("share_folder/" + req.params.user_name + "/" + req.params.folder_name + "/", ""));
              file_size.push(byteFormat(data.Contents[i].Size, 2));
            }

            console.log(url);

            const share_url = 'https://rakushare.bounceme.net/share/' + req.params.user_name + '/' + req.params.folder_name + '?k=' + req.query.k;

            QRCode.toDataURL(share_url, (error, qr_url) => {
              if (error) {
                console.log(error);
                return;
              }
              res.render('share.ejs', {
                user_name: req.cookies.name,
                share_user_name: req.params.user_name,
                folder_name: req.params.folder_name,
                passkey: req.query.k,
                data: data.Contents,
                url: url,
                file_name: file_name,
                file_size: file_size,
                share_url: share_url,
                qr_url: qr_url,
              });        
            });
          }
        });
      }
    } else {
      res.render('index.ejs', {
        user_name: req.cookies.name,
        toast: 10,
      });
    }
  });
});

// ルームへアクセス
app.post('/room_join', (req, res) => {
  connection.query(`SELECT *
                    FROM folder
                    INNER JOIN users
                    ON folder.user = users.ID
                    WHERE folder_name = ? AND user_name = ?;`,
    [req.body.room_name, req.body.room_owner], function (error, results, fields) {
    if (error) throw error;
    console.log(results);
    if(results.length == 0){
      res.render('index.ejs', {
        user_name: req.cookies.name,
        toast: 10,
      })
    }
    if(!bcrypt.compareSync(req.body.passkey, results[0].passkey)){
      res.render('index.ejs', {
        user_name: req.cookies.name,
        toast: 11,
      })
    } else {
      res.redirect('/share/' + req.body.room_owner + '/' + req.body.room_name + '?k=' + results[0].passkey);
    }
  });
})

// ルームリスト（フォルダ一覧）
app.get('/room_list', (req, res) => {
  // cookieがない場合はログイン画面にリダイレクト
  if (req.cookies.name === undefined) {
    res.redirect('/');
  }
  connection.query(`SELECT * FROM folder WHERE user = (SELECT id FROM users WHERE user_name = ?) AND delete_date > NOW() ORDER BY delete_date DESC;`,
    [req.cookies.name], function (error, results, fields) {
    if (error) throw error;
    console.log(results);
    res.render('room_list.ejs', {
      user_name: req.cookies.name,
      room_list: results,
    });
  });
});

app.delete('/room_list', (req, res) => {
  console.log("share_folder/" + req.cookies.name + "/" + req.body.folder_name);
  connection.query(`DELETE FROM folder WHERE folder_name = ? AND user = (SELECT id FROM users WHERE user_name = ?);`,
    [req.body.folder_name, req.cookies.name], function (error, results, fields) {
    if (error) throw error;
    // S3ファイル削除
    // フォルダ内のオブジェクトを取得
    var params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Prefix: "share_folder/" + req.cookies.name + "/" + req.body.folder_name,
    };
    s3.listObjects(params, (err, data) => {
      if (err) throw err;

      // オブジェクトがある場合は削除
      if (data.Contents.length === 0) {
        console.log('フォルダは空です');
        res.status(200).send();
        return;
      }

      // オブジェクトを削除
      s3.deleteObjects(
        {
          Bucket: process.env.AWS_BUCKET_NAME,
          Delete: {
            Objects: data.Contents.map(({ Key }) => ({ Key })),
            Quiet: false,
          },
        },
        (err, data) => {
          if (err) throw err;
          console.log('フォルダが削除されました');
          res.status(200).send();
        }
      );
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
      // 元のユーザ名のフォルダを削除
      // フォルダ内のオブジェクトを取得
      var params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Prefix: "share_folder/" + req.cookies.name,
      };
      s3.listObjects(params, (err, data) => {
        if (err) throw err;
        // オブジェクトがある場合は削除
        if (data.Contents.length === 0) {
          console.log('フォルダは空です');
          return;
        }
        // オブジェクトを削除
        s3.deleteObjects(
          {
            Bucket: process.env.AWS_BUCKET_NAME,
            Delete: {
              Objects: data.Contents.map(({ Key }) => ({ Key })),
              Quiet: false,
            },
          },
          (err, data) => {
            if (err) throw err;
            console.log('フォルダが削除されました');
          }
        );
      });
      // 元のユーザ名のフォルダをDBから削除
      connection.query('DELETE FROM folder WHERE user = (SELECT id FROM users WHERE user_name = ?);',
      [req.cookies.name],
      (error, results, fields) => {
        if (error) throw error;
        console.log('The solution is: ', results);
      });
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

// cron, 有効期限が切れたフォルダ（ルーム）名をDBから削除
cron.schedule('* * * * *', () => {
  connection.query('DELETE FROM folder WHERE delete_date < NOW();',
  (error, results, fields) => {
    if (error) throw error;
    console.log('cron job completed');
  });
});

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

/**
 * バイト書式変換
 * @param {number} number 適用する数値
 * @param {number} [point=0] 小数点の桁数
 * @param {number} [com=1024] 1KBあたりのバイト数
 * @return {string} 書式化された値を返す
 */
function byteFormat(number, point, com) {
	if (typeof number === 'undefined') throw '適用する数値が指定されていません。';
	if (!String(number).match(/^[0-9][0-9\.]+?/)) throw '適用する数値に誤りがあります。';
	if (!point) point = 0;
	if (!com) com = 1024;

	var bytes  = Number(number),
    suffix = ['Byte', 'KB', 'MB', 'GB', 'TB', 'PB', 'ZB', 'YB'],
    target = Math.floor(Math.log(bytes) / Math.log(com));

	return (bytes / Math.pow(com, Math.floor(target))).toFixed(point) + ' ' + suffix[target];
};

https.listen(443);