// 答えデータ（採点処理は ../../../assets/js/quiz.js）
// 形式: "小問番号#答え"。解答欄が複数ある問題は "B@原文" のように @ で区切る。
// 大問題１
var answerFirstArr = ["1#chu1me2n","2#qi3chua2ng","3#ka1ishi3","4#jie2shu4","5#hui2jia1","6#to2ngxue2","7#jia4oshi4","8#shi2ta2ng","9#me3itia1n","10#xue2xia4o"];
// 大問題２
var answerSecondArr = ["1#B","2#D","3#C","4#A","5#D"];
// 大問題3
var answerThirdArr = ["1#4132","2#45231","3#43172865","4#52314","5#356241","6#52431","7#325641","8#532531"];
// 大問題4
var answerFourthArr = ["1#他晚上在家里吃晚饭。","2#你每天六点回家吗？","3#我们在教室吃午饭。","4#我从九点到十二点在学校。","5#明天山田不来学校。"];
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
