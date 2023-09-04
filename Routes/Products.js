const router = require('express').Router();

const productCtrl = require("../Controllers/Products")

router.post("/", productCtrl.createProduct)

router.get("/", productCtrl.getAll)
router.get("/stock/:stockId", productCtrl.getFromStock)

module.exports = router;