const express = require("express");
const app = express();

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', __dirname+'/views');
app.set("view options", {layout: false});
app.use('/', express.static(__dirname));

app.get('/', function (req, res) {
    res.render('index.html');
});

app.listen(3000);