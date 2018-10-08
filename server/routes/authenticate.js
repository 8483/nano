var express = require("express");
var router = express.Router();
var jwt = require("jsonwebtoken"); // used to create, sign, and verify tokens

router.post("/authenticate", function(req, res) {
    let req_username = req.body.username.replace(/[\\%_;'"]/g, "\\$&");
    let req_password = req.body.password.replace(/[\\%_;'"]/g, "\\$&");

    var user = {
        username: "admin",
        password: "admin"
    };

    if (
        user &&
        user.username === req_username &&
        user.password === req_password
    ) {
        var token = jwt.sign(user, "nano_salt", {
            expiresIn: 60 * 60 * 10 // expires in 10 hours
        });

        return res.status(200).send({
            success: true,
            token: token,
            user: user.username
        });
    } else {
        res.status(401).send({
            message: "Погрешно име или лозинка."
        });
    }
});

// ivan
module.exports = router;
