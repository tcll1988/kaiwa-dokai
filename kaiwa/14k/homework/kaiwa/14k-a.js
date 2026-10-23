// 答えデータ（採点処理は ../../../assets/js/quiz.js）
// 形式: "小問番号#答え"。解答欄が複数ある問題は "B@原文" のように @ で区切る。
// 大問題１
var answerFirstArr = ["1#B","2#B","3#A","4#C","5#B"];
// 大問題２
var answerSecondArr = ["1#E","2#C","3#A","4#D","5#B"];
// 大問題3
var answerThirdArr = ["1#B","2#B","3#C","4#D","5#B"];
// 大問題4
var answerFourthArr = ["1#B@你什么时候能来？","2#C@麻烦您叫好美接一下电话，好吗？","3#A@下星期天是铃木十八岁的生日。","4#D@咱们见面商量一下儿怎么样？","5#E@我怎么给你打电话呢？"];
// 大問題5
var answerFivethArr = ["1#A","2#E","3#F","4#B","5#D","6#C"];
// 大問題6
var answerSixthArr = ["1#37518624","2#143256","3#142854973","4#37251486","5#6241573"];
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
