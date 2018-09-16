var express = require("express"); // Web Framework
var app = express();
var bodyParser = require("body-parser"); // define our app using express
var journals = require("./routes/journals");
var authenticate = require("./routes/authenticate");

// Allow requests from all domains and localhost
app.all("/*", function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "X-Requested-With, Content-Type, Accept"
    );
    res.header("Access-Control-Allow-Methods", "POST, GET");
    next();
});

app.use(bodyParser.urlencoded({ extended: false }))
    .use(bodyParser.json())
    .use(authenticate)
    .use(journals);

var server = app.listen(8080, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log("app listening at http://%s:%s", host, port);
});
