# rakushare

## 就職作品用Repo

- RakuShare (簡単にファイル共有)

### 以下企画案  

``` txt
アカウント登録不要でマルチプラットフォームでファイルを受け渡しできるアプリケーション。

ファイルを常にサーバ側にアップロードしておくオンラインストレージ(GoogleDrive,iCloud)の様な使い方ではなく、ファイルを共有したいときにアップロードして、その都度アクセスリンクとパスワードを共有して一時的に共有したいときに利用できるサービス。
ファイルの共有を停止すると、サーバ側のファイルも削除して漏洩を防ぐ仕組みにする。

iPhoneやiPad同士ではAirDropを使ってファイルの送受信が行えるが、iPhoneとAndroid端末などの違うプラットフォーム同士の場合はこれが不可能なので、同じ様に気軽にファイルを送受信するアプリケーションを作りたい。

ファイルのアクセスナンバーやパスワードをQRコードやBluetoothを通じて共有先を共有できる方法があればより簡単に共有できると思う為、実装していきたい。

アプリをインストールせずとも簡単に利用できるようにブラウザベース(Node.js,PHP)を利用して制作する。
iPhone、iPad、Android等の端末でのネイティブアプリの場合はFlutterを使用し専用アプリケーションを作成したい。
```

### 利用技術(予定)

- Node.js (Express, multer, multer-s3)
- AWS S3
- AWS DynamoDB or Aurora
- ~Python (fastAPI)~
- Flutter (Native, WebView) ...余裕があれば

### 日程

- 作品情報 (文字、スクリーンショット) -> 1月末
- 動画のURL （Google Drive） -> 1月末
- 動画の完成 -> 2月19日
- システムの完成 -> 2月26日

### EC2 Lets Encript

``` bash
sudo certbot certonly --standalone -d xxxxx.bounceme.net
```

### EC2 Launch Node Server

``` bash
sudo `which node` index.js
```

## 動画やらなんやら

https://drive.google.com/file/d/1ZOSud_uG8n6R_K16tSY_muNUwEHZhIfK/view?usp=share_link
