const router = require('express').Router();

const stockCtrl = require("../Controllers/Stocks")

router.post("/", stockCtrl.createStock)
router.post("/:id/appro", stockCtrl.appro)
router.post("/:id/remove", stockCtrl.remove)
router.post("/transfer/:fromId/to/:toId", stockCtrl.transfer)

router.get("/", stockCtrl.getAll)
router.get("/:id", stockCtrl.getOne)

module.exports = router;