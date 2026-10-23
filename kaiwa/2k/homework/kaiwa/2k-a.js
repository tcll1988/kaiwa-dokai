// 答えデータ（採点処理は ../../../assets/js/quiz.js）
// 形式: "小問番号#答え"。解答欄が複数ある問題は "B@原文" のように @ で区切る。
// 大問題１
var answerFirstArr = ["1#la3o","2#na2n","3#za1ng","4#ha3o","5#la2n","6#ba2i","7#he1i","8#hua2ng","9#ho2ng","10#hui1"];
// 大問題２
var answerSecondArr = ["1#B","2#A","3#A","4#A","5#B"];
// 大問題3
var answerThirdArr = ["1#A@A","2#B","3#A","4#A","5#B"];
// 大問題4
var answerFourthArr = ["1#今天@今日は何月何日ですか。","2#明天@明日は「子供の日」です。",
　　　　　　　　　　　　　　"3#生日@昨日は私の誕生日です。","4#是五月五号@明日は五月五日ですか。","5#五月四号@今日は五月四日ではありません。"];
// 大問題5
var answerFifthArr = ["1#明天是儿童节吗？","2#你的生日是几月几号？","3#山田爱子今年多大了？","4#昨天不是四月六号。","5#明天是我的生日。@祝贺你。"];
// 大問題6
var answerSixthArr = ["1#A","2#D","3#B","4#A","5#C"];
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
