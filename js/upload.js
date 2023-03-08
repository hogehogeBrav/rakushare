//ドキュメントロード時に、toastr のオプションを設定する
toastr.options = {
  "closeButton": true,
  "debug": false,
  "newestOnTop": false,
  "progressBar": true,
  "positionClass": "toast-bottom-center",
  "preventDuplicates": false,
  "onclick": null,
  "showDuration": "300",
  "hideDuration": "1000",
  "timeOut": "5000",
  "extendedTimeOut": "5000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "tapToDismiss": false
}

toastr.success('ルームを作成しました！', 'ルーム作成');

var myDropzone = new Dropzone("div#awesome", { 
  url: "/upload?folder_name=" + folder_name,
  method: "put",
  maxFiles: 6, // ファイル数の上限
  maxFilesize: 100, // ファイルサイズ、MB
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
  console.log(file.name); // 削除対象のファイル名が取得
  $.ajax({
    url: "/upload",
    type: "DELETE",
    data: {
      file_name: file.name,
      folder_name: folder_name
    },
    dataType: "text"
  })
  .done(function(data) {
    console.log("success");
  })
  .fail(function(data) {
    console.log("error");
  })
  .always(function(data) {
    console.log("complete");
  });
  // トースト通知
  toastr.success('ファイルを削除しました', '削除完了');
}).on("maxfilesexceeded", function(file){
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