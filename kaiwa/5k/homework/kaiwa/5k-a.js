// 答えデータ（採点処理は ../../../assets/js/quiz.js）
// 形式: "小問番号#答え"。解答欄が複数ある問題は "B@原文" のように @ で区切る。
// 大問題１
var answerFirstArr = ["1#le3ng","2#yua3n","3#kua4i","4#ma4n","5#hua4i","6#pa4ng","7#sho4u","8#ga1o","9#di1","10#ji4n"];
// 大問題２
var answerSecondArr = ["1#A","2#A","3#A","4#A","5#B"];
// 大問題3
var answerThirdArr = ["1#A","2#B","3#C","4#B","5#A"];
// 大問題4
var answerFourthArr = ["1#明天@あのう、明日の天気はどうですか。","2#不忙@あなたは今忙しいですか。",
　　　　　　　　　　　　　　"3#喝茶@おかけください。お茶を飲んでください。","4#我们@今年の夏休み、私たちは南京に行きたいですが、あなたは。","5#同学@今日私はクラスメートと公園に行きたいです。"];
// 大問題5
var answerFifthArr = ["1#我想去中国。","2#我想喝茶。","3#我们大学很大。","4#南京的夏天很热。","5#中文不太难。"];
// 大問題6
var answerSixthArr = ["1#A","2#A","3#A","4#D","5#A"];
// 問題配列　,の後に貼り付け
var answerArray = [answerFirstArr, answerSecondArr, answerThirdArr, answerFourthArr, answerFifthArr, answerSixthArr];


// 点数1
// var pointFirstArr = ["1#4","2#2","3#1","4#1","5#1","6#1","7#1","8#1","9#1","10#1"];
// 問題配列　,の後に貼り付け
// 
// 提出された問題
// var point_arr_string = new Array();
// 
// CSVファイルパス
//var CSVFilePath = "F:/dokai/homework/csv/homeworkfile.csv";

// ファイル入力流
//var fso=new ActiveXObject("Scripting.FileSystemObject");
//以写的方式打开文件
//var ForWriting=2;
//打开文件并从文件末尾开始写
//var ForAppending=8;
//var f;
