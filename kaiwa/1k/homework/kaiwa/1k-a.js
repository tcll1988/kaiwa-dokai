// 答えデータ（採点処理は ../../../assets/js/quiz.js）
// 形式: "小問番号#答え"。解答欄が複数ある問題は "B@原文" のように @ で区切る。
// 大問題１
var answerFirstArr = ["1#ba4","2#jie3","3#ge1","4#gui4","5#shu1","6#yi2","7#me4i","8#di4","9#gu1","10#nu2"];
// 大問題２
var answerSecondArr = ["1#B","2#B","3#A","4#B","5#B"];
// 大問題3
var answerThirdArr = ["1#D","2#B","3#A","4#C","5#A@A"];
// 大問題4
var answerFourthArr = ["1#姓@叫@私の苗字は山田で、山田愛子と言います。","2#老师@先生、なんとおっしゃいますか。",
　　　　　　　　　　　　　　"3#中文@山田愛子は中国語を勉強しています。","4#请坐@ようこそ、おかけください。","5#不客气@ありがとうございます。どういたしまして。"];
// 大問題5
var answerFifthArr = ["1#我是爱知淑德大学的学生。","2#老师，您贵姓？","3#我姓张，叫张华。","4#欢迎欢迎，请坐。","5#谢谢，不客气。"];
// 大問題6
var answerSixthArr = ["1#B","2#D","3#C","4#A","5#C"];
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
