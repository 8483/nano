var express = require("express");
var router = express.Router();
var mysql = require("mysql");
require('../../utils/utils.js')();

var config = {
    user: "root",
    password: "",
    host: "localhost",
    database: "nano",
    multipleStatements: true
};

// GET all journals - array of objects
router.get("/company", function (req, res) {

    var connection = mysql.createConnection(config);

    connection.connect();

    const query = `
        select * from company
    `;

    connection.query(query, function (error, results, fields) {
        if (error) {
            console.log(error);
            res.status(500).send({
                message: error
            });
        } else {
            res.status(200).send(results);
        }
    });

    connection.end();
});

module.exports = router;