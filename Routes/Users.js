const router = require('express').Router();

const userCtrl = require("../Controllers/Users")

router.post("/login", userCtrl.login)

module.exports = router;