var express = require("express");
var router = express.Router();
var mysql = require("mysql");

var config = {
    user: "root",
    password: "",
    host: "localhost",
    database: "nano"
};


router.get("/journals", function (req, res) {

    var connection = mysql.createConnection(config);

    connection.connect();

    const query = `
        select 
            id,
            journal_key,
            date(journal_date) journal_date
        from journal
    `;

    connection.query(query, function (error, results, fields) {
        if (error) {
            console.log(error);
            res.status(500).send({
                message: error
            });
        } else {
            console.log(results);
            res.status(200).send(results);
        }
    });

    connection.end();
});

router.get("/journals/:id", function (req, res) {
    let journalId = req.params.id;
    var connection = mysql.createConnection(config);

    connection.connect();

    const query = `
        select * from journal_item where journal_id = ?
    `;

    connection.query(query, journalId, function (error, results, fields) {
        if (error) {
            console.log(error);
            res.status(500).send({
                message: error
            });
        } else {
            console.log(results);
            res.status(200).send(results);
        }
    });

    connection.end();
});

/*
Multiple placeholders are mapped to values in the same order as passed. 
For example, in the following query foo equals a, bar equals b, baz equals c, and id will be userId:

connection.query('UPDATE users SET foo = ?, bar = ?, baz = ? WHERE id = ?', ['a', 'b', 'c', userId], function (error, results, fields) {
  if (error) throw error;
  // ...
});
*/

router.post("/journals", function (req, res) {
    // journalItems.push({
    //     id: journalItems.length,
    //     journalId: req.body.journalId,
    //     company: req.body.company,
    //     date: req.body.date,
    //     document: req.body.document,
    //     accountDebit: req.body.accountDebit,
    //     accountCredit: req.body.accountCredit,
    //     amountDebit: req.body.amountDebit,
    //     amountCredit: req.body.amountCredit
    // });
    // res.status(200).send({
    //     message: `Success!`
    // });

    let uid = req.body.uid;
    console.log(uid);

    var connection = mysql.createConnection(config);

    connection.connect();

    const query = `
            insert into journal_item (journal_id, company_id, document_date, document_key, account_debit_id, account_credit_id, amount_debit, amount_credit)
            values (?, ?, ?, ?, ?, ?, ?, ?)
        `;

    console.log(req.body)

    let journal_items = [
        parseInt(req.body.journalId),
        parseInt(req.body.company),
        req.body.date,
        req.body.document,
        req.body.accountDebit,
        req.body.accountCredit,
        parseFloat(req.body.amountDebit),
        parseFloat(req.body.amountCredit)
    ];

    console.log(journal_items)

    connection.query(query, journal_items, function (error, results, fields) {
        if (error) {
            console.log(error);
            res.status(500).send({
                message: error
            });
        } else {
            console.log(results);
            res.status(200).send({
                message: results
            });
        }
    });

    connection.end();
});


module.exports = router;