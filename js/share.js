// indexへ戻る
$("#back").on("click", function(){
  history.back();
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

