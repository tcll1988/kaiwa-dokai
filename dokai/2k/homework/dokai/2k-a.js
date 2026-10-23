// 大問題１
var answerFirstArr = ["1#nua3nhuo","2#pia4oliang","3#ba2itia1n","4#Ri4be3n","5#ma1ma","6#le3ngre4","7#fe1icha2ng","8#xia4nza4i","9#chu1ntia1n","10#wa3nshang"];
// 大問題２
var answerSecondArr = ["1#A","2#C","3#D","4#B","5#D"];
// 大問題3
var answerThirdArr = ["1#2413","2#132","3#2431","4#65274127","5#42351","6#25143","7#7316531","8#261435"];
// 大問題4
var answerFourthArr = ["1#春天很暖和。","2#樱花很漂亮。","3#我弟弟也是学生。","4#春天的花儿多吗？","5#她们也都是学生。"];
// 大問題5
// var answerFifthArr = ["1#我是学生@A"];
// 問題配列　,の後に貼り付け
var answerArray = [answerFirstArr, answerSecondArr, answerThirdArr, answerFourthArr];


// 点数1
// var pointFirstArr = ["1#4","2#2","3#1","4#1","5#1","6#1","7#1","8#1","9#1","10#1"];
// 問題配列　,の後に貼り付け
// var pointSumArray = [pointFirstArr];

// 提出された問題
// var point_arr_string = new Array();
// var pointArrayStr = "";

// CSVファイルパス
//var CSVFilePath = "F:/dokai/homework/csv/homeworkfile.csv";

// ファイル入力流
//var fso=new ActiveXObject("Scripting.FileSystemObject");
//以写的方式打开文件
//var ForWriting=2;
//打开文件并从文件末尾开始写
//var ForAppending=8;
//var f;

// num1:大問題No, num2: 少問題No　動くな
function doFindAnswer(num1, num2) {
    // 答え
    var result="";
    // 大問題No
    if (num1 > 0) {
      if (answerArray.length >= num1) {
        // 大問題を取得
        var firstLeveArray = answerArray[num1 - 1];
        
        // 小問題配列空判断
        if (firstLeveArray.length > 0) {
          // 小問題配列を繰り返す
          for (var i = 0; i < firstLeveArray.length; i++) {
            // 小問題回答文字
            var answers = firstLeveArray[i];
            // 問題Noを判断
            var noAndString = answers.split("#");
            if (noAndString.length < 2) {
              return;
            }
            
            // 問題Noを比較
            if (noAndString[0] == num2) {
              result = noAndString[1];
              break;;
            }
          }
        }
      }
    }
    
    // 答えを戻す
    return result;
};

// num1:大問題No, num2: 少問題No　動くな
function doFindPoint(num1, num2) {
    // 点数
    var point = 0;
    // 大問題No
      if (pointSumArray.length >= num1) {
        // 大問題を取得
        var firstLeveArray = pointSumArray[num1 - 1];
        
        // 小問題配列空判断
        if (firstLeveArray.length >= num2) {
            // 小問題回答文字
            var answers = firstLeveArray[num2 - 1];
            // 問題Noを判断
            var noAndString = answers.split("#");
            if (noAndString.length < 2) {
              return point;
            }
            // 問題点数を返す
            point = noAndString[1];
        }
      }
    
    // 答えを戻す
    return point;
};

// num1:大問題No, num2: 少問題No　動くな
function doCheckHaved(num1, num2, pointArrayStr) {
  // 結果 初期値該当問題なし
  var resule = false;
  // 問題Indexを計算
  var queIndex = 0;
  // 回答済み問題の数値
  var pointArr = pointArrayStr.split('a')
  var answeredCnt = pointArr.length - 1;
  // 大問題数を数え
  var firstLevelCount = answerArray.length;
  // 大問題NUM-1が0以下の場合、処理抜け
  if ((num1 - 1) < 0) {
    return;
  }
  // 大問題１の場合
  if (num1 = 1) {
    // 該当問題のindexを設定
    queIndex = num2;
    
    if (queIndex <= answeredCnt) {
      resule = true;
    }
  }
  // 大問題２以上の場合
  if (num1 > 1)  {
    // 問題配列をループ
    for (var i = 0; i < pointFirstArr.length; i++) {
      // 大問題数値を判断
      if (i < (num1 -1)) {
        // indexを加算
        queIndex = queIndex + answerArray[i].length;
      } else {
        break;
      }
    }
    
    // 該当大問題の小問題数値を加算
    queIndex = queIndex + num2;
    
    if (queIndex <= answeredCnt) {
      resule = true;
    }
  }
  
  // 結果を返す
  return resule;
};


function putAnswer(resultStr) {
    point_arr_string.push(resultStr);
}

function gerResultStr() {
  alert(point_arr_string);
  return point_arr_string;
}
//将内容写到指定路径
//function writeFile(content,filePath){
//var timestamp = new Date();·
//alert(timestamp);
//    alert(content);
//    alert(filePath);
//    f=fso.OpenTextFile(filePath,ForAppending,true);
//    f.WriteLine(content);
//    f.close();
//};

