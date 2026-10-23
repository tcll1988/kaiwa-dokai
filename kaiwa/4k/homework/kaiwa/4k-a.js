// 答えデータ（採点処理は ../../../assets/js/quiz.js）
// 形式: "小問番号#答え"。解答欄が複数ある問題は "B@原文" のように @ で区切る。
// 大問題１
var answerFirstArr = ["1#wa4n","2#qia1n","3#yi4","4#ba3i","5#shi2","6#li2ng","7#zha4o","8#shua1ng","9#wu3","10#liu4"];
// 大問題２
var answerSecondArr = ["1#B","2#B","3#A","4#A","5#B"];
// 大問題3
var answerThirdArr = ["1#A@B","2#A@B","3#A","4#C@C","5#B"];
// 大問題4
var answerFourthArr = ["1#都@あなたは毎日学校に行って授業をうけますか。","2#两点@三点@私は午後二時から三時まで宿題をします。",
　　　　　　　　　　　　　　"3#没有@昨日、あなたはバイトしましたか。","4#明天@あなたは明日学校に来ますか。","5#没有@昨日水曜日、私はバイトしていませんでした。"];
// 大問題5
var answerFifthArr = ["1#山田从星期一到星期五来学校。","2#现在十二点，中文课到十二点半。","3#你在这儿等公共汽车吗？","4#老师下午四点回家。","5#明天我来大学，你呢？"];
// 大問題6
var answerSixthArr = ["1#A","2#C","3#D","4#B","5#A"];
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
