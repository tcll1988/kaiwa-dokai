// 答えデータ（採点処理は ../../../assets/js/quiz.js）
// 形式: "小問番号#答え"。解答欄が複数ある問題は "B@原文" のように @ で区切る。
// 大問題１
var answerFirstArr = ["1#A","2#D","3#C","4#D","5#C"];
// 大問題２
var answerSecondArr = ["1#B","2#D","3#A","4#C","5#E"];
// 大問題3
var answerThirdArr = ["1#B","2#C","3#B","4#A","5#C"];
// 大問題4
var answerFourthArr = ["1#B@咱们一起去打网球，好不好？","2#C@我有一个问题，可以问一下儿吗？","3#E@明天有中文课，你预习了吗？","4#D@你的中文真好！","5#A@田中的中文真好！"];
// 大問題5
var answerFivethArr = ["1#C","2#A","3#E","4#D","5#B","6#F"];
// 大問題6
var answerSixthArr = ["1#136254","2#72318546","3#16432857","4#314562","5#125436"];
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
