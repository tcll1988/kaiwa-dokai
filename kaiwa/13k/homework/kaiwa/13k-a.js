// 答えデータ（採点処理は ../../../assets/js/quiz.js）
// 形式: "小問番号#答え"。解答欄が複数ある問題は "B@原文" のように @ で区切る。
// 大問題１
var answerFirstArr = ["1#C","2#A","3#D","4#C","5#D"];
// 大問題２
var answerSecondArr = ["1#C","2#B","3#A","4#E","5#D"];
// 大問題3
var answerThirdArr = ["1#B","2#B","3#C","4#C","5#D"];
// 大問題4
var answerFourthArr = ["1#E@你每天运动吗？","2#A@你喝茶还是喝咖啡？","3#D@我该回去了，我还没写完作业呢。","4#B@好久不见了，你最近忙吗？","5#C@你的中文进步真快！"];
// 大問題5
var answerFivethArr = ["1#F","2#B","3#E","4#A","5#C","6#D"];
// 大問題6
var answerSixthArr = ["1#213654","2#13562358","3#1437562","4#4263715","5#314562"];
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
