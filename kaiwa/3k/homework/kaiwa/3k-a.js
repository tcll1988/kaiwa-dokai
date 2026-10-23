// 答えデータ（採点処理は ../../../assets/js/quiz.js）
// 形式: "小問番号#答え"。解答欄が複数ある問題は "B@原文" のように @ で区切る。
// 大問題１
var answerFirstArr = ["1#xio2ng","2#ya2ng","3#yi1ng","4#go3u","5#ya1","6#hu3","7#shu3","8#tu4","9#ji1","10#she2"];
// 大問題２
var answerSecondArr = ["1#A","2#A","3#B","4#B","5#B"];
// 大問題3
var answerThirdArr = ["1#A","2#C","3#E","4#D","5#B"];
// 大問題4
var answerFourthArr = ["1#我@これは私のボールペンです。","2#吗@あれはあなたの辞書ですか。",
　　　　　　　　　　　　　　"3#谁@張華は誰？","4#都@この学生たちはみな愛知淑徳大学の学生ですか。","5#铅笔@圆珠笔@これは鉛筆ですか。それともボールペンですか。"];
// 大問題5
var answerFifthArr = ["1#那也是中文词典吗？","2#今天是八号还是九号？","3#这些都是英文词典吗？","4#山田是谁？","5#那些学生也都是爱知淑德大学的学生吗？"];
// 大問題6
var answerSixthArr = ["1#C","2#A","3#C","4#B","5#A"];
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
