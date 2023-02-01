var myDropzone = new Dropzone("div#awesome", { 
  url: "/upload?folder_name=" + folder_name,
  method: "put",
  maxFiles: 6,
  dictMaxFilesExceeded: "ファイルは6ファイルまで追加が可能です。",
  dictDefaultMessage: "ここにファイルをドラッグ&ドロップ<br>OR<br>クリックしてファイルを選択",
  addRemoveLinks: true,
  dictCancelUpload:'キャンセル' ,
  dictRemoveFile: "削除する",
  // thumbnailWidth: 100,
  // thumbnailHeight: 100,
}).on("success", function(file, serverResponse){
  // // ファイルを受け取るphp側では、アップロードされたファイルの保存名を返すようにしておく
  // // するとserverResponseにファイルの名前が返ってくる。
  // console.log(serverResponse); // デバッグ用
  // file.previewElement.querySelector("img").alt = serverResponse; // imgタグのalt属性にサーバから受け取ったファイル名を持たせておく
}).on("removedfile", function(file){
  // 削除ボタンが押された時
  // console.log( file.previewElement.querySelector("img").alt ); // 削除対象のファイル名が取得出来る
  // $.ajax(...);//あとは非同期でファイル名を指定して削除するサーバサイドプログラムへリクエスト
}).on("maxfilesexceeded", function(file)
{
  // ファイル数が上限に達した時
  this.removeFile(file);
  swal("ファイルは6ファイルまで追加が可能です。");
});;

// indexへ戻る
$("#back").on("click", function(){
  location.href = "/";
});

// シェアモーダル
$(document).on('click', '#share', function(event) {
  event.preventDefault();
  $('#share_modal').iziModal('open');
});
$('#share_modal').iziModal({
  title: 'シェアする',
  subtitle: 'リンクをコピーして送るか、QRコードを相手に見せましょう！',
  headerColor: "#0f9574",
  radius: 10,
});

// リンクコピー
$(document).on('click', '#copy-url', function(event) {
  event.preventDefault();
  var copyTarget = document.getElementById("share_url");
  copyTarget.select();
  document.execCommand("Copy");
  swal("リンクをコピーしました！");
});

// QRコード表示モーダル
$(document).on('click', '#show-qr-code', function(event) {
  event.preventDefault();
  $('#qr_code_modal').iziModal('open');
});
$('#qr_code_modal').iziModal({
  title: '共有QRコード',
  headerColor: "#0f9574",
  radius: 10,
});


// スクロール無効
$('body').css('overflow', 'hidden');