const express = require("express");
const router = express.Router();
const {
	createRoom,
	deleteRoom,
	getRoomById,
	getRooms,
	updateRoom,
} = require("../controllers/roomController");

router.get("/", getRooms);
router.get("/:id", getRoomById);
router.post("/", createRoom);
router.put("/:id", updateRoom);
router.delete("/:id", deleteRoom);

module.exports = router;