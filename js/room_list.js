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

// 削除ルーム名変数
let delete_folder_name = "";

// ルーム削除モーダル
$(document).on('click', '.room_delete', function(event) {
  delete_folder_name = $(this).attr("value");
  $('#delete_folder_name').html(delete_folder_name + "を削除しますか？");
  // $('#room_delete').val(delete_folder_name);
  console.log(delete_folder_name);
  event.preventDefault();
  $('#room_delete_modal').iziModal('open');
});
$('#room_delete_modal').iziModal({
  title: 'ルーム削除',
  subtitle: 'ルームを削除しますか？',
  headerColor: "#0f9574",
  radius: 10,
});

// ルーム削除
$(document).on('click', '#room_delete', function(event) {
  event.preventDefault();
  $.ajax({
    url: '/room_list',
    type: 'DELETE',
    data: {
      folder_name: delete_folder_name
    },
    dataType: 'text'
  })
  .done(function(data) {
    console.log("success");
    // リストから削除
    $('.' + delete_folder_name).remove();
    // 成功トーストメッセージ
    toastr.success(delete_folder_name + 'のルームを削除しました', 'ルームを閉じました。');
  })
  .fail(function(data) {
    console.log("error");
    // エラートーストメッセージ
    toastr.error('ルームを削除できませんでした。', 'エラー');
  })
  .always(function(data) {
    console.log("complete");
    // モーダル閉じる
    $('#room_delete_modal').iziModal('close');
  });
});

$(document).on('click', '#room_delete_cancel', function(event) {
  event.preventDefault();
  $('#room_delete_modal').iziModal('close');
});

// indexへ戻る
$("#back").on("click", function(){
  history.back();
});

// スクロール無効
$('body').css('overflow', 'hidden');