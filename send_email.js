
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: 'qq',
    auth: {
        user: '1320238991@qq.com',
        pass: 'mwwszbglwarpfghe' //授权码,通过QQ获取

    }
});
router.post('/send', function (req, res, next) {
    // 获取前端传递过来的参数
    var emailaddress = req.body.emailaddress;
    var home = req.body.home;
    var work = req.body.work;
    var fav_places = req.body.fav_places;

    var sendHtml = `<div>
      <div>home : ${home}</div>
      <div>work : ${work}</div>
      <div>fav_places : ${fav_places}</div>
      <div>emailaddress : ${emailaddress}</div>
      <div>file : <a href="${imgurl}">down upload file</a> </div>
    </div>`;

    var mailOptions = {
        // 发送邮件的地址
        from: '**********@qq.com', // login user must equal to this user
        // 接收邮件的地址
        to: '**********@gmail.com',  // xrj0830@gmail.com
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
    res.status(200).json({message: req.body.emailaddress});
});

// var mailOptions = {
//     from: '1320238991@qq.com', // 发送者
//     to: 'ztt0821k@gmail.com', // 接受者,可以同时发送多个,以逗号隔开
//     subject: 'nodemailer2.5.0邮件发送', // 标题
//     text: 'Hello world', // 文本
//     // html: `<h2>nodemailer基本使用:</h2><h3>
//     // <a href="http://blog.csdn.net/zzwwjjdj1/article/details/51878392">
//     // http://blog.csdn.net/zzwwjjdj1/article/details/51878392</a></h3>`
// };
//
// transporter.sendMail(mailOptions, function (err, info) {
//     if (err) {
//         console.log(err);
//         return;
//     }
//
//     console.log('发送成功');
// });
