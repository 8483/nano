var express = require("express");
var router = express.Router();
var mysql = require("mysql");

router.get("/journal", function (req, res) {
    let journal = journals[journals.length - 1];
    res.send(journal);
});

router.get("/journals", function (req, res) {
    // console.log(journals);
    res.send(journals);
});

router.get("/journals/:journalId", function (req, res) {
    var journalId = req.params.journalId;
    var items = journalItems.filter(item => item.journalId == journalId);
    // console.log(items);
    res.send(items);
});

var config = {
    user: "root",
    password: "",
    host: "localhost",
    database: "nano"
};

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


router.put("/journals", function (req, res) {

    console.log(journalItems.filter(item => item.id == req.body.journalItemId))

    journalItems.map(item => {
        if (item.id == req.body.journalItemId) {
            item.company = req.body.company
            item.date = req.body.date
            item.type = req.body.type
            item.document = req.body.document
            item.accountDebit = req.body.accountDebit
            item.accountCredit = req.body.accountCredit
            item.amountDebit = req.body.amountDebit
            item.amountCredit = req.body.amountCredit
        }
    });

    console.log(journalItems.filter(item => item.id == req.body.journalItemId))

    res.status(200).send({
        message: `Success!`
    });
});

module.exports = router;

var journals = [];
var journalItems = [];

for (var i = 0; i < 15; i++) {
    journals.push({
        id: i + 1,
        code: `18-440-${Math.floor(Math.random() * 100)}`
    });
}

for (var i = 0; i < 150; i++) {
    journalItems.push({
        id: i + 1,
        journalId: Math.floor(Math.random() * journals.length + 1),
        company: `Фирма ${Math.floor(Math.random() * 10 + 1)}`,
        date: `${Math.floor(Math.random() * 32)}.${Math.floor(
            Math.random() * 13
        )}.201${Math.floor(Math.random() * 8)}`,
        type: `Вид налог ${Math.floor(Math.random() * 10 + 1)}`,
        document: `Фактура ${Math.floor(Math.random() * 30 + 1)}`,
        accountDebit: 1200 + Math.floor(Math.random() * 30 + 1),
        accountCredit: 2200 + Math.floor(Math.random() * 30 + 1),
        amountDebit: Math.floor(Math.random() * 10000),
        amountCredit: Math.floor(Math.random() * 10000)
    });
}

// console.log(journals);
// console.log(journalItems);