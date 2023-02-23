/**
 * バイト書式変換
 * @param {number} number 適用する数値
 * @param {number} [point=0] 小数点の桁数
 * @param {number} [com=1024] 1KBあたりのバイト数
 * @return {string} 書式化された値を返す
 */
var byteFormat = function(number, point, com) {
	if (typeof number === 'undefined') throw '適用する数値が指定されていません。';
	if (!String(number).match(/^[0-9][0-9\.]+?/)) throw '適用する数値に誤りがあります。';
	if (!point) point = 0;
	if (!com) com = 1024;

	var bytes  = Number(number),
    suffix = ['Byte', 'KB', 'MB', 'GB', 'TB', 'PB', 'ZB', 'YB'],
    target = Math.floor(Math.log(bytes) / Math.log(com));

	return (bytes / Math.pow(com, Math.floor(target))).toFixed(point) + ' ' + suffix[target];
};