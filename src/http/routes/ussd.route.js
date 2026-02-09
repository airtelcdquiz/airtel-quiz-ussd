const router = require("express").Router();
const controller = require("../controllers/ussd.controller");

router.post("/", controller.handle);

module.exports = router;
