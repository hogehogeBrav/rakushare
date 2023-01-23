// button
const button = document.querySelector('button');

// アップロードモーダル
$(document).on('click', '#upload', function(event) {
  event.preventDefault();
  $('#upload_modal').iziModal('open');
});
$('#upload_modal').iziModal({
  title: '共有設定',
  subtitle: 'ルーム名とアクセスパスワードを設定してください',
  headerColor: "#0f9574",
  radius: 10,
});

$(document).on('click', '#upload_cancel', function(event) {
  event.preventDefault();
  $('#upload_modal').iziModal('close');
});

// ダウンロードモーダル

// 設定モーダル
$(document).on('click', '#settings', function(event) {
  event.preventDefault();
  $('#setting_modal').iziModal('open');
});
$('#setting_modal').iziModal({
  title: '設定',
  subtitle: '設定を変更できます',
  headerColor: "#0f9574",
  radius: 10,
});

// 使い方モーダル
$(document).on('click', '#info', function(event) {
  event.preventDefault();
  $('#info_modal').iziModal('open');
});
$('#info_modal').iziModal({
  title: '使い方',
  subtitle: '使い方を説明します',
  headerColor: "#0f9574",
  radius: 10,
});