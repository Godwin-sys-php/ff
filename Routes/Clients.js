const router = require('express').Router();

const clientCtrl = require("../Controllers/Clients")

router.post("/", clientCtrl.createClient)

router.get("/", clientCtrl.getAll)

module.exports = router;