var express = require("express"); // Web Framework
var app = express();
var bodyParser = require("body-parser"); // define our app using express
var authenticate = require("./routes/authenticate");

var journal = require("./routes/journal");
var company = require("./routes/company");

// Allow requests from all domains and localhost
app.all("/*", function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "X-Requested-With, Content-Type, Accept"
    );
    res.header("Access-Control-Allow-Methods", "POST, GET");
    // res.header("Content-Type", 'application/json');
    next();
});

app.set('json spaces', 2) // Provides json response indentation

app.use(bodyParser.urlencoded({
        extended: false
    }))
    .use(bodyParser.json())
    .use(authenticate)
    .use(company)
    .use(journal);

// ivan
var server = app.listen(8080, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log("app listening at http://%s:%s", host, port);
});