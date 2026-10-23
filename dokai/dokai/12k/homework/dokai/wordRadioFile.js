// メディアプレイヤー
var audio = document.createElement("audio");

// radioファイル
var radioFileWord = "";

// ファイル再生
function playRadioFile() {
  
  // フォルダ
  var folderPath = 'sound/';
  // フルパス
  var filePath = folderPath.concat(radioFileWord);

  audio.src = filePath;
  // ファイル再生処理
  audio.play();
};

function setRadioFile(fileName) {
  // ファイル設定
  radioFileWord = fileName;
  
  // ファイル再生
  playRadioFile();
};

