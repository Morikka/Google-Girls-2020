var t= require('./email_test');
// console.log(t.json);
var json_data = t.json;
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: '163',
    auth: {
        user: 'googlegirlscovid19@163.com',
        pass: 'TIKDVKBNQOWWPMKM' //授权码,通过QQ获取

    }
});
// router.post('./email_test', function (req, res, next) {
//     // 获取前端传递过来的参数
//     var emailaddress = req.body.emailaddress;
//     var home = req.body.home;
//     var home_case = req.body.home_case;
//     var work = req.body.work;
//     var work_case = req.body.work_case;
//     var fav_places = req.body.fav_places;
//     var vis_places = req.body.vis_places;
//
//     var sendHtml = `<div>
//       <div>home : ${home}</div>
//       <div>home_case : ${home_case}</div>
//       <div>work : ${work}</div>
//       <div>work_case : ${work_case}</div>
//       <div>fav_places : ${fav_places}</div>
//       <div>vis_places : ${vis_places}</div>
//       <div>emailaddress : ${emailaddress}</div>
//       <div>file : <a href="${imgurl}">down upload file</a> </div>
//     </div>`;
//
//     var mailOptions = {
//         // 发送邮件的地址
//         from: 'googlegirlscovid19@163.com', // login user must equal to this user
//         // 接收邮件的地址
//         to: 'ztt0821k@gmail.com',  // xrj0830@gmail.com
//         // 邮件主题
//         subject: 'You have a new uploaded file',
//         // 以HTML的格式显示，这样可以显示图片、链接、字体颜色等信息
//         html: sendHtml
//     };
//     // 发送邮件，并有回调函数
//     transporter.sendMail(mailOptions, function (error, info) {
//         if (error) {
//             return console.log(error);
//         }
//         console.log('Message sent: ' + info.response);
//     });
//     res.status(200).json({message: req.body.emailaddress});
// });
var emailaddress = json_data.email;
var home = json_data.home;
//var home_case = json_data.home_case;
var home_case = {caseID:80,"start-date":"2020-07-01","end_date":"2020-07-15"};
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
    to: 'ztt0821k@gmail.com',  // xrj0830@gmail.com
    // 邮件主题
    subject: 'You have a new uploaded file',
    // 以HTML的格式显示，这样可以显示图片、链接、字体颜色等信息
    html: sendHtml
};
// 发送邮件，并有回调函数
transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
        return console.log(error);
    }
    console.log('Message sent: ' + info.response);
});
