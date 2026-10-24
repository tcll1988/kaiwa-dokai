// 答えデータ（採点処理は ../../../assets/js/quiz.js）
// 形式: "小問番号#答え"。解答欄が複数ある問題は "B@原文" のように @ で区切る。
// 大問題１
var answerFirstArr = ["1#to2u","2#tui3","3#jia3o","4#ya3n","5#e3r","6#bi2","7#zui3","8#ya2","9#she2","10#sho3u"];
// 大問題２
var answerSecondArr = ["1#B","2#B","3#A","4#B","5#B"];
// 大問題3
var answerThirdArr = ["1#B","2#A","3#E","4#C","5#D"];
// 大問題4
var answerFourthArr = ["1#五@今日、私はボールペンを五本を買いました。","2#电影@昨日、私は映画を見ました。",
　　　　　　　　　　　　　　"3#学校@昨日、彼は学校に行きました。","4#和@私は山田さんと一緒に公園に行きました。","5#中文书@彼女は五冊の中国語の本を持っています。"];
// 大問題5
var answerFifthArr = ["1#昨天我看中国电影了。","2#昨天的电影挺有意思的。","3#我和山田一起去学校。","4#我不想和山田一起去学校。","5#昨天哥哥学习了五个小时中文。"];
// 大問題6
var answerSixthArr = ["1#C","2#A","3#B","4#A","5#B"];
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
