const router = require("express").Router();
const { authenticate } = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { updateMeSchema } = require("../validators/users.validators");
const { getMe, updateMe } = require("../controllers/users.controller");

router.get("/me", authenticate, getMe);
router.patch("/me", authenticate, validate(updateMeSchema), updateMe);

module.exports = router;
