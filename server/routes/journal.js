var express = require("express");
var router = express.Router();
var mysql = require("mysql");
require('../../utils/utils.js')();

var config = {
    user: "root",
    //password: "",
    host: "localhost",
    database: "nano",
    multipleStatements: true
};

// TODO: Add pagination
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
                journalKey,
                journalTypeId,
                DATE_FORMAT(journalDate, "%d.%m.%Y") as journalDate,
                (select sum(amountDebit) from journalItem ji where ji.journalId = j.id) as debit,
                (select sum(amountCredit) from journalItem ji where ji.journalId = j.id) as credit
            from journal j
        ) t1
        order by journalKey desc
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
            journalKey,
            journalTypeId,
            DATE_FORMAT(journalDate, "%d.%m.%Y") as journalDate
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
            companyId,
            c.companyKey companyKey,
            c.name companyName,
            DATE_FORMAT(documentDate, "%d.%m.%Y") documentDate,
            documentKey,
            accountDebit,
            accountCredit,
            amountDebit,
            amountCredit
        from journalItem ji
            left join company c
                on c.id = ji.companyId
        where journalId = ?
        order by timeInsert asc;
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
        from journalItem
        where journalId = ? and id = ?
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
            insert into journalItem (
                journalId, 
                companyId, 
                documentDate, 
                documentKey, 
                accountDebit, 
                accountCredit, 
                amountDebit, 
                amountCredit,
                timeInsert
            )
            values (?, ?, ?, ?, ?, ?, ?, ?, now())
        `;

    console.log(req.body)

    let journalItem = [
        journalId,
        req.body.company ? parseInt(req.body.company) : null,
        req.body.date ? req.body.date : null,
        req.body.document ? req.body.document : null,
        req.body.accountDebit ? req.body.accountDebit : null,
        req.body.accountCredit ? req.body.accountCredit : null,
        req.body.amountDebit ? parseFloat(req.body.amountDebit) : null,
        req.body.amountCredit ? parseFloat(req.body.amountCredit) : null
    ];

    // console.log(journalItem)

    connection.query(query, journalItem, function (error, results, fields) {
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
            update journalItem set
                companyId = ?, 
                documentDate = ?, 
                documentKey = ?, 
                accountDebit = ?, 
                accountCredit = ?, 
                amountDebit = ?, 
                amountCredit = ?,
                timeChange = now()
            where journalId = ? and id = ?
        `;

    console.log(req.body)

    let journalItem = [
        isInt(req.body.companyId) ? parseInt(req.body.companyId) : null,
        req.body.documentDate ? toDate(req.body.documentDate) : null,
        req.body.documentKey,
        req.body.accountDebit ? req.body.accountDebit : null,
        req.body.accountCredit ? req.body.accountCredit : null,
        req.body.amountDebit ? parseFloat(req.body.amountDebit) : null,
        req.body.amountCredit ? parseFloat(req.body.amountCredit) : null,
        journalId,
        journalItemId
    ];

    // console.log(journalItem)

    connection.query(query, journalItem, function (error, results, fields) {
        if (error) {
            console.log(error);
            res.status(500).send({
                status: 500,
                message: error
            });
        } else {
            res.status(200).send({
                status: 200,
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
            delete from journalItem
            where journalId = ? and id = ?
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