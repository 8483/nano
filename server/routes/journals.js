var express = require("express");
var router = express.Router();

router.get("/journal", function(req, res) {
    let journal = journals[journals.length - 1];
    res.send(journal);
});

router.get("/journals", function(req, res) {
    console.log(journals);
    res.send(journals);
});

router.get("/journals/:journalId", function(req, res) {
    var journalId = req.params.journalId;
    var items = journalItems.filter(item => item.journalId == journalId);
    console.log(items);
    res.send(items);
});

router.post("/journals", function(req, res) {
    journalItems.push({
        id: journalItems.length,
        journalId: req.body.journalId,
        document: req.body.document,
        amount: req.body.amount
    });
    res.status(200).send({ message: `Success!` });
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

{
    /* Овие полиња да се симулираат
<td>Фирма</td>
<td>Датум</td>
<td>Вид</td>
<td>Документ</td>
<td>Конто Должи</td>
<td>Конто Побарува</td>
<td>Износ Должи</td>
<td>Износ Побарува</td> */
}

for (var i = 0; i < 150; i++) {
    journalItems.push({
        id: i + 1,
        journalId: Math.floor(Math.random() * journals.length + 1),
        document: `Фактура ${Math.floor(Math.random() * 30 + 1)}`,
        amount: Math.floor(Math.random() * 10000)
    });
}

console.log(journals);
console.log(journalItems);
