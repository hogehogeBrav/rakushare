// button
const button = document.querySelector('button');

//ドキュメントロード時に、toastr のオプションを設定する
toastr.options = {
  "closeButton": true,
  "debug": false,
  "newestOnTop": false,
  "progressBar": false,
  "positionClass": "toast-bottom-center",
  "preventDuplicates": false,
  "onclick": null,
  "showDuration": "300",
  "hideDuration": "1000",
  "timeOut": "1000000000",
  "extendedTimeOut": "1000000000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "tapToDismiss": false
}

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

// ユーザー名変更確認モーダル
$(document).on('click', '#username_confirm', function(event) {
  event.preventDefault();
  $('#username_confirm_modal').iziModal('open');
});
$('#username_confirm_modal').iziModal({
  title: 'ユーザ名を変更しますか？',
  headerColor: "#0f9574",
  radius: 10,
});
// ユーザー名変更確認OK -> form submit
$(document).on('click', '#username_confirm_button', function(event) {
  event.preventDefault();
  $('#username_form').submit();
});
// ユーザー名変更確認キャンセル -> モーダル閉じる
$(document).on('click', '#username_cancel_button', function(event) {
  event.preventDefault();
  $('#username_confirm_modal').iziModal('close');
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

// トーストメッセージ表示部
if(toast == 1) toastr.error('以前に同じ名前で作成した場合は、「ルームを見る」でルームを確認してください', 'このルーム名は既に使用されています！');
if(toast == 2) toastr.error('ルーム名とアクセスパスワードを入力してください', '入力エラー');
if(toast == 3) toastr.error('アクセスパスワードは半角英数字で入力してください', '入力エラー');
if(toast == 4) toastr.error('ブラウザのクッキーを削除してもう一度試してください', 'ユーザー名エラー');
// ユーザ名
if(toast == 5) swal("ユーザ名を入力してください。");
if(toast == 6) swal("ユーザー名は20文字以内で入力してください。");
if(toast == 7) swal("ユーザー名は半角英数字で入力してください。");
if(toast == 8) swal("ユーザー名は既に使用されています！\n別のユーザー名を試してください。");
if(toast == 9) toastr.success('ユーザー名を変更しました', '変更完了');
// フォルダエラー
if(toast == 10) toastr.error('フォルダが存在しないか、既に削除されています', 'フォルダエラー');

// 設定後モーダル展開
if(toast > 5 && toast < 9) $("#setting_modal").iziModal('open');

// スクロール無効
$('body').css('overflow', 'hidden');