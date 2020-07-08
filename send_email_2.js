var t= require('./email_test');
var json_data = t.json;
const nodemailer = require('nodemailer')
var transporter = nodemailer.createTransport({
    service: '163',
    auth: {
        user: 'googlegirlscovid19@163.com',
        pass: 'TIKDVKBNQOWWPMKM' //授权码,通过QQ获取
    }
});

var emailaddress = json_data.email;
var home = json_data.home;
// var home_case = {caseID:80,"start-date":"2020-07-01","end_date":"2020-07-15"};
var home_case = json_data.home_case;
var work = json_data.work;
var work_case = json_data.work_case;
var fav = json_data.fav_places;
for(var i in fav){
    var flag = fav[i].flag
    if (flag) {
        delete fav[i].flag;
    }
    else{
        delete fav[i].flag;
        fav[i].cases = "None";
    }
}
var vis= json_data.vis_places;
for(var j in vis){
    var flag2 = vis[j].flag
    if (flag2) {
        delete vis[j].flag;
    }
    else{
        delete vis[j].flag;
        vis[j].cases = "None";
    }
}
var home_case2 = JSON.stringify(home_case)
var work_case2 = JSON.stringify(work_case)
var fav2 = JSON.stringify(fav)
var vis2 = JSON.stringify(vis)

console.log(home_case);
var home_notification = "Now your home address is: "+home+".\nWe noticed these places in 500 meters near your home has cases: \n";
for(const item in home_case){
    console.log(home_case[item]);
    const place_name = home_case[item]["mapName"];
    var tmp = "The place "+place_name+" has cases, the cases is as follows: \n"
    for(const items in home_case[item]["cases"]){
        console.log(items)
        tmp += "Case id is: "+home_case[item]["cases"][items]["caseID"]+", the start time is: "+home_case[item]["cases"][items]["start_date"] + "the start time is: "+home_case[item]["cases"][items]["end_date"] + "\n";
    }
    home_notification += tmp;
}

console.log(home_notification);

var sendHtml = `<div>
      <div>home : ${home}</div>
      <div>home_case : ${home_case2}</div>
      <div>work : ${work}</div>
      <div>work_case : ${work_case2}</div>
      <div>fav_places : ${fav2}</div>
      <div>vis_places : ${vis2}</div>
      <div>emailaddress : ${emailaddress}</div>
    </div>`;

var mailOptions = {
    // 发送邮件的地址
    from: 'googlegirlscovid19@163.com', // login user must equal to this user
    // 接收邮件的地址
    to: '9just.k.on@gmail.com',  // xrj0830@gmail.com
    // 邮件主题
    subject: 'Daily notification about Covid 19 in Hong Kong',
    // 以HTML的格式显示，这样可以显示图片、链接、字体颜色等信息
    html: sendHtml
};
// 发送邮件，并有回调函数
// transporter.sendMail(mailOptions, function (error, info) {
//     if (error) {
//         return console.log(error);
//     }
//     console.log('Message sent: ' + info.response);
// });
