// 答えデータ（採点処理は ../../../assets/js/quiz.js）
// 形式: "小問番号#答え"。解答欄が複数ある問題は "B@原文" のように @ で区切る。
// 大問題１
var answerFirstArr = ["1#Yi1ngwe2n","2#da4xue2","3#di4di","4#shi4","5#Zho1ngwe2n","6#xi4ng","7#Sha1ntia2n","8#xi3huan","9#xue2xi2","10#xue2sheng"];
// 大問題２
var answerSecondArr = ["1#A","2#D","3#C","4#B","5#C"];
// 大問題3
var answerThirdArr = ["1#321","2#231","3#3142","4#3142","5#4132","6#321","7#2143","8#3142"];
// 大問題4
var answerFourthArr = ["1#我是学生。","2#我喜欢中文。","3#我叫山田爱子。","4#我姓山田。","5#我弟弟是爱知淑德大学的学生。"];
// 大問題5
var answerFifthArr = ["1#我是学生@A"];
// 問題配列　,の後に貼り付け
var answerArray = [answerFirstArr, answerSecondArr, answerThirdArr, answerFourthArr, answerFifthArr];


// 点数1
var pointFirstArr = ["1#4","2#2","3#1","4#1","5#1","6#1","7#1","8#1","9#1","10#1"];
// 問題配列　,の後に貼り付け
var pointSumArray = [pointFirstArr];

// 提出された問題
var point_arr_string = new Array();
var pointArrayStr = "";

// CSVファイルパス
//var CSVFilePath = "F:/dokai/homework/csv/homeworkfile.csv";

// ファイル入力流
//var fso=new ActiveXObject("Scripting.FileSystemObject");
//以写的方式打开文件
//var ForWriting=2;
//打开文件并从文件末尾开始写
//var ForAppending=8;
//var f;
