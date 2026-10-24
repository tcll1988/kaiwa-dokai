// 答えデータ（採点処理は ../../../assets/js/quiz.js）
// 形式: "小問番号#答え"。解答欄が複数ある問題は "B@原文" のように @ で区切る。
// 大問題１
var answerFirstArr = ["1#xie2","2#ta1ng","3#sa3n","4#qu2n","5#za3o","6#re2n","7#shui3","8#ye4","9#ya2n","10#xi3"];
// 大問題２
var answerSecondArr = ["1#A","2#A","3#A","4#A","5#B"];
// 大問題3
var answerThirdArr = ["1#B","2#A","3#D","4#C@F","5#E"];
// 大問題4
var answerFourthArr = ["1#你呢@私は東京に行ったことがあります。","2#附近@私たちの学校のあたりに、一軒の中華レストランがあります。",
　　　　　　　　　　　　　　"3#书@あなたは中国語の本を読んだことがありますか。","4#怎么样@明日私たちは一緒に公園に行ってはどうですか。","5#好不好@夏休み私は一緒に中国に行ってはどうですか。"];
// 大問題5
var answerFifthArr = ["1#田中学过中文。","2#越吃越想吃。","3#这本书越看越想看。","4#咱们去中国饭馆儿吃包子吧。","5#咱们去吃饺子吧。"];
// 大問題6
var answerSixthArr = ["1#A","2#B","3#D","4#B","5#A"];
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
