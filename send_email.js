function emailSending(t) {
    var json_data = t;
    console.log(json_data);
    const nodemailer = require('nodemailer')
    var transporter = nodemailer.createTransport({
        service: '163',
        auth: {
            user: 'googlegirlscovid19@163.com',
            pass: 'TIKDVKBNQOWWPMKM' //授权码,通过163获取
        }
    });

    var emailaddress = json_data.email;
    var home = json_data.home;
// var home_case = {caseID:80,"start-date":"2020-07-01","end_date":"2020-07-15"};
    var home_case = json_data.home_case;
    var work = json_data.work;
    var work_case = json_data.work_case;
    var fav = json_data.fav_places;
    var vis = json_data.vis_places;


// console.log(home_case);
// home_case
    var home_notification = "🏠 Now your home address is: " + home + ".<br>"
    if (home_case[0] === undefined) {
        home_notification += "We noticed 500 meters near your home doesn't have cases";
    } else {
        home_notification += "We noticed these places in 500 meters near your home has cases: <br>";
        for (const item in home_case) {
            // console.log(home_case[item]);
            const place_name = home_case[item]["mapName"];
            var tmp = "👉" + place_name + "'s case number:" + "😷" + String(Object.keys(home_case[item]["cases"]).length) + "<br>"
            var i = 1;
            for (const items in home_case[item]["cases"]) {
                if(home_case[item]["cases"][items]===null) continue;
                tmp += "&emsp;" + "(" + i + "):" + "Case id is: " + home_case[item]["cases"][items]["caseID"] + ", the start time is: " + home_case[item]["cases"][items]["start_date"] + " the end time is: " + home_case[item]["cases"][items]["end_date"] + "<br>";
                i += 1
            }
            home_notification += tmp;
        }
    }

// work_case
    var work_notification = "💻 Now your work address is: " + work + ".<br>"
    if (work_case[0] === undefined) {
        work_notification += "We noticed 500 meters near your work doesn't have cases";
    } else {
        work_notification += "We noticed these places in 500 meters near your work has cases: <br>";
        for (const item in work_case) {
            // console.log(home_case[item]);
            const place_name = work_case[item]["mapName"];
            var tmp = "👉" + place_name + "'s case number:" + "😷" + String(Object.keys(work_case[item]["cases"]).length) + "<br>"
            var i = 1;
            for (const items in work_case[item]["cases"]) {
                if(work_case[item]["cases"][items]===null) continue;
                tmp += "&emsp;" + "(" + i + "):" + "Case id is: " + work_case[item]["cases"][items]["caseID"] + ", the start time is: " + work_case[item]["cases"][items]["start_date"] + " the end time is: " + work_case[item]["cases"][items]["end_date"] + "<br>";
                i += 1;
            }
            work_notification += tmp;
        }
    }


//fav_place
    var fav_notification = "❤️The recent information on your favourite place:<br>"
    if (fav[0] === undefined) {
        fav_notification += "We noticed 500 meters near your favourite doesn't have cases";
    } else {
        fav_notification += "We noticed these places in 500 meters near your favourite place has cases: <br>";
        for (const item in fav) {
            console.log(fav[item]);
            const place_name = fav[item]["mapName"];
            if (fav[item]["flag"]) {
                var tmp2 = "👉" + place_name + "'s case number:" + "😷" + String(Object.keys(fav[item]["cases"]).length) + "<br>";
                var i = 1;
                for (const items in fav[item]["cases"]) {
                    if(fav[item]["cases"][items]===null) continue;
                    tmp2 += "&emsp;" + "(" + i + "):" + "Case id is: " + fav[item]["cases"][items]["caseID"] + ", the start time is: " + fav[item]["cases"][items]["start_date"] + " the end time is: " + fav[item]["cases"][items]["end_date"] + "<br>";
                    i += 1;
                }
            } else {
                var tmp2 = "👉 " + place_name + ": no case.<br>"
            }
            fav_notification += tmp2;
        }
    }


    console.log(fav_notification);
//vis_place
    var vis_notification = "🚩The recent information on your visit place:<br>"
    if (vis[0] === undefined) {
        vis_notification += "We noticed 500 meters near your favourite doesn't have cases";
    } else {
        vis_notification += "We noticed these places in 500 meters near your visit place has cases: <br>";
        for (const item in vis) {
            console.log(vis[item]);
            const place_name = vis[item]["mapName"];
            if (vis[item]["flag"]) {
                var i = 1;
                var tmp2 = "👉" + place_name + "'s case number:" + "😷" + String(Object.keys(vis[item]["cases"]).length) + "<br>";
                for (const items in vis[item]["cases"]) {
                    if(vis[item]["cases"][items]===null) continue;
                    tmp2 += "&emsp;" + "(" + i + "):" + "Case id is: " + vis[item]["cases"][items]["caseID"] + ", the start time is: " + vis[item]["cases"][items]["start_date"] + " the end time is: " + vis[item]["cases"][items]["end_date"] + "<br>";
                    i += 1;
                }
            } else {
                var tmp2 = "👉 " + place_name + ": no case.<br>"
            }
            vis_notification += tmp2;
        }
    }

    console.log(vis_notification);
    var sendHtml = `<div>
      <div>${home_notification}</div>
      <br>
      <br>
      <div>${work_notification}</div>
      <br>
      <br>
      <div>${fav_notification}</div>
      <br>
      <br>
      <div>${vis_notification}</div>
    </div>`;

    console.log(sendHtml);

    var mailOptions = {
        // 发送邮件的地址
        from: 'googlegirlscovid19@163.com', // login user must equal to this user
        // 接收邮件的地址
        to: emailaddress,  // xrj0830@gmail.com
        // 邮件主题
        subject: 'Daily notification about Covid 19 in Hong Kong',
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
}
exports.emailSending = emailSending;