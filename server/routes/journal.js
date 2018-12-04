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
                journal_type_id,
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
            res.status(200).send(results);
        }
    });

    connection.end();
});

// GET one journal header - object - the_move
router.get("/journals/:id", function (req, res) {
    let journalId = req.params.id;
    var connection = mysql.createConnection(config);

    connection.connect();

    const queryJournalHeader = `
        select
            journal_key,
            journal_type_id,
            DATE_FORMAT(journal_date, "%d.%m.%Y") as journal_date
        from journal where id = ?;
    `;

    // Executes 2 queries and returns 1 object with 2 results.
    connection.query(queryJournalHeader, journalId, function (error, results, fields) {
        if (error) {
            console.log(error);
            res.status(500).send({
                message: error
            });
        } else {
            // Format the response as an object, instead of array
            // console.log(response)
            res.status(200).send(results[0]);
        }
    });

    connection.end();
});

// GET one journal, all items - array of objects + object - the_moveitem
router.get("/journals/:id/items", function (req, res) {
    let journalId = req.params.id;
    var connection = mysql.createConnection(config);

    connection.connect();

    const queryJournalItems = `
        select
            ji.id,
            company_id,
            c.company_key company_key,
            c.name company_name,
            DATE_FORMAT(document_date, "%d.%m.%Y") document_date,
            document_key,
            account_debit,
            account_credit,
            amount_debit,
            amount_credit
        from journal_item ji
            left join company c
                on c.id = ji.company_id
        where journal_id = ?
        order by time_insert asc;
    `;

    connection.query(queryJournalItems, journalId, function (error, results, fields) {
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

// GET one journal, one item - object
router.get("/journals/:journalId/items/:journalItemId", function (req, res) {

    let journalId = req.params.journalId;
    let journalItemId = req.params.journalItemId;

    var connection = mysql.createConnection(config);

    connection.connect();

    const query = `
        select * 
        from journal_item
        where journal_id = ? and id = ?
    `;

    connection.query(query, [journalId, journalItemId], function (error, results, fields) {
        if (error) {
            console.log(error);
            res.status(500).send({
                message: error
            });
        } else {
            res.status(200).send(results[0]);
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


router.post("/journals/:journalId/items", function (req, res) {

    let journalId = req.params.journalId;

    var connection = mysql.createConnection(config);

    connection.connect();

    const query = `
            insert into journal_item (
                journal_id, 
                company_id, 
                document_date, 
                document_key, 
                account_debit, 
                account_credit, 
                amount_debit, 
                amount_credit,
                time_insert
            )
            values (?, ?, ?, ?, ?, ?, ?, ?, now())
        `;

    console.log(req.body)

    let journal_items = [
        journalId,
        req.body.company ? parseInt(req.body.company) : null,
        req.body.date ? req.body.date : null,
        req.body.document ? req.body.document : null,
        req.body.accountDebit ? req.body.accountDebit : null,
        req.body.accountCredit ? req.body.accountCredit : null,
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
            console.log(results)
            res.status(200).send({
                message: results
            });
        }
    });

    connection.end();
});

router.put("/journals/:journalId/items/:journalItemId", function (req, res) {

    let journalId = req.params.journalId;
    let journalItemId = req.params.journalItemId;

    var connection = mysql.createConnection(config);

    connection.connect();

    const query = `
            update journal_item set
                company_id = ?, 
                document_date = ?, 
                document_key = ?, 
                account_debit = ?, 
                account_credit = ?, 
                amount_debit = ?, 
                amount_credit = ?,
                time_change = now()
            where journal_id = ? and id = ?
        `;

    console.log(req.body)

    let journal_items = [
        isInt(req.body.company) ? parseInt(req.body.company) : null,
        req.body.date,
        req.body.document,
        req.body.accountDebit ? req.body.accountDebit : null,
        req.body.accountCredit ? req.body.accountCredit : null,
        req.body.amountDebit ? parseFloat(req.body.amountDebit) : null,
        req.body.amountCredit ? parseFloat(req.body.amountCredit) : null,
        journalId,
        journalItemId
    ];

    console.log(journal_items)

    connection.query(query, journal_items, function (error, results, fields) {
        if (error) {
            console.log(error);
            res.status(500).send({
                message: error
            });
        } else {
            res.status(200).send({
                message: results
            });
        }
    });

    connection.end();
});

router.delete("/journals/:journalId/items/:journalItemId", function (req, res) {

    let journalId = req.params.journalId;
    let journalItemId = req.params.journalItemId;

    var connection = mysql.createConnection(config);

    connection.connect();

    const query = `
            delete from journal_item
            where journal_id = ? and id = ?
        `;

    connection.query(query, [journalId, journalItemId], function (error, results, fields) {
        if (error) {
            console.log(error);
            res.status(500).send({
                message: error
            });
        } else {
            res.status(200).send({
                message: results
            });
        }
    });

    connection.end();
});


module.exports = router;