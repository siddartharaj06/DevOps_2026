const router = require("express").Router();
const asyncHandler = require("../middleware/asyncHandler");
const c = require("../controllers/user.controller");

router.post("/", asyncHandler(c.createUser));
router.get("/", asyncHandler(c.getUsers));
router.get("/:id", asyncHandler(c.getUserById));
router.put("/:id", asyncHandler(c.updateUser));
router.delete("/:id", asyncHandler(c.deleteUser));

module.exports = router;
