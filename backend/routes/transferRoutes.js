const express = require("express");
const router = express.Router();
const {
	createTransfer,
	deleteTransfer,
	getTransferById,
	getTransfers,
	updateTransfer,
} = require("../controllers/transferController");

router.get("/", getTransfers);
router.get("/:id", getTransferById);
router.post("/", createTransfer);
router.put("/:id", updateTransfer);
router.delete("/:id", deleteTransfer);

module.exports = router;
