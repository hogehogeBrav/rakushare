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

// ユーザー名変更
$(document).on('click', '#user_name_button', function(event) {
  if(usernameCheck($('#user_name').val())) {
    const sendData = {
      user_name: $('#user_name').val()
    }

    $.ajax({
      url: '/user_name',
      type: 'POST',
      data: sendData,
      dataType: 'text'
    })
    .done(function(data) {
      toastr.success('ユーザー名を変更しました', '変更完了');
    })
    .fail(function(data) {
      toastr.error('ユーザー名を変更できませんでした', '変更失敗');
    })
    .always(function(data) {
      $('#setting_modal').iziModal('close');
    });
  }
});

// 入札金額チェック
function usernameCheck(str){
  console.log(str.length);
  switch(true){
    // ユーザー名が空の場合
    case str == "":
      swal("ユーザ名を入力してください。");
      return false;
    // ユーザー名が20文字以上の場合
    case str.length > 20:
      swal("ユーザー名は20文字以内で入力してください。");
      return false;
    // ユーザー名が半角英数字以外の場合
    case !str.match(/^[a-zA-Z0-9]+$/):
      swal("ユーザー名は半角英数字で入力してください。");
      return false;
    default:
      return true;
  }
}

// アップロードエラー表示部
if(upload_error == 1) toastr.error('以前に同じ名前で作成した場合は、「ルームを見る」でルームを確認してください', 'このルーム名は既に使用されています！');
if(upload_error == 2) toastr.error('ルーム名とアクセスパスワードを入力してください', '入力エラー');
if(upload_error == 3) toastr.error('アクセスパスワードは半角英数字で入力してください', '入力エラー');
if(upload_error == 4) toastr.error('ブラウザのクッキーを削除してもう一度試してください', 'ユーザー名エラー');

// スクロール無効
$('body').css('overflow', 'hidden');