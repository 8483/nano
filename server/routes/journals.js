var express = require("express");
var router = express.Router();
var mysql = require("mysql");

var config = {
    user: "root",
    password: "",
    host: "localhost",
    database: "nano",
    multipleStatements: true
};


router.get("/journals", function (req, res) {

    var connection = mysql.createConnection(config);

    connection.connect();

    const query = `
        select 
            *,
            t1.debit - t1.credit as balance
        from (
            select 
                j.id,
                journal_key,
                DATE_FORMAT(journal_date, "%d.%m.%Y") as journal_date,
                (select sum(amount_debit) from journal_item ji where ji.journal_id = j.id) as debit,
                (select sum(amount_credit) from journal_item ji where ji.journal_id = j.id) as credit
            from journal j
        ) t1
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

    const queryJournalHeader = `
        select
            journal_key,
            DATE_FORMAT(journal_date, "%d.%m.%Y") as journal_date
        from journal where id = ?;
    `;

    const queryJournalItems = `
        select
            id,
            company_id,
            DATE_FORMAT(document_date, "%d.%m.%Y") as document_date,
            document_key,
            account_debit_id,
            account_credit_id,
            amount_debit,
            amount_credit
        from journal_item where journal_id = ?;
    `;

    const queryJournalBalance = `
        select
            sum(amount_debit) as total_debit,
            sum(amount_credit) as total_credit,
            sum(amount_debit) - sum(amount_credit) as balance
        from journal_item where journal_id = ?;
    `;

    // Executes 2 queries and returns 1 object with 2 results.
    connection.query(queryJournalHeader + queryJournalItems + queryJournalBalance, [journalId, journalId, journalId], function (error, results, fields) {
        if (error) {
            // console.log(error);
            res.status(500).send({
                message: error
            });
        } else {
            // console.log(results);
            // Format the response as an object, instead of array
            let response = {
                header: results[0][0], // No need for array with one item
                items: results[1], // Must be array
                balance: results[2][0]
            }
            console.log(response)
            res.status(200).send(response);
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

    var connection = mysql.createConnection(config);

    connection.connect();

    const query = `
            insert into journal_item (
                journal_id, 
                company_id, 
                document_date, 
                document_key, 
                account_debit_id, 
                account_credit_id, 
                amount_debit, 
                amount_credit
            )
            values (?, ?, ?, ?, ?, ?, ?, ?)
        `;

    console.log(req.body)

    let journal_items = [
        parseInt(req.body.journalId),
        req.body.company ? parseInt(req.body.company) : "",
        req.body.date,
        req.body.document,
        req.body.accountDebit ? parseInt(req.body.accountDebit) : null,
        req.body.accountCredit ? parseInt(req.body.accountCredit) : null,
        req.body.amountDebit ? parseFloat(req.body.amountDebit) : null,
        req.body.amountCredit ? parseFloat(req.body.amountCredit) : null
    ];

    // console.log(journal_items)

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