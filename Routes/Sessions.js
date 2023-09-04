const router = require('express').Router();

const sessionCtrl = require("../Controllers/Sessions")

router.post("/", sessionCtrl.createSession)
router.post("/:id", sessionCtrl.addProduct2Session)
router.post("/:id/generate", sessionCtrl.generateBill)
router.post("/:id/status", sessionCtrl.changeStatus)
router.post("/:id/edit", sessionCtrl.edit)

router.post("/items/:id/remove", sessionCtrl.removeOneProduct)
router.post("/items/:id/price", sessionCtrl.changePrice)

router.get("/list/not-done", sessionCtrl.getNotDone)
router.get("/:id", sessionCtrl.getOne)

module.exports = router;