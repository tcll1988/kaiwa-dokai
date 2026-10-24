// 答えデータ（採点処理は ../../../assets/js/quiz.js）
// 形式: "小問番号#答え"。解答欄が複数ある問題は "B@原文" のように @ で区切る。
// 大問題１
var answerFirstArr = ["1#A","2#D","3#D","4#D","5#A"];
// 大問題２
var answerSecondArr = ["1#E","2#A","3#C","4#B","5#D"];
// 大問題3
var answerThirdArr = ["1#D","2#C","3#D","4#D","5#C"];
// 大問題4
var answerFourthArr = ["1#B@你怎么感冒了呢？","2#E@老师，我发烧，头疼得要命。","3#A@请问，挂号室怎么走？","4#C@打针好得快，还是打一针吧。","5#D@太晚了，我该回家了。"];
// 大問題5
var answerFivethArr = ["1#D","2#C","3#F","4#B","5#A","6#E"];
// 大問題6
var answerSixthArr = ["1#124365","2#3571264","3#124365","4#352164","5#5742531"];
// 問題配列　,の後に貼り付け
var answerArray = [answerFirstArr, answerSecondArr, answerThirdArr, answerFourthArr, answerFivethArr, answerSixthArr];


// 点数1
// var pointFirstArr = ["1#4","2#2","3#1","4#1","5#1","6#1","7#1","8#1","9#1","10#1"];
// 問題配列　,の後に貼り付け
// var pointSumArray = [pointFirstArr];

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
