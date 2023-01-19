// button
const button = document.querySelector('button');

// 入札モーダル
$(document).on('click', '#upload', function(event) {
  event.preventDefault();
  $('#upload_modal').iziModal('open');
});
$('#upload_modal').iziModal({
  title: '共有設定',
});