const Transfer = require("../models/transfer");

exports.getTransfers = async (req, res) => {
	try {
		const transfers = await Transfer.find().sort({ createdAt: -1 });
		res.json(transfers);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

exports.getTransferById = async (req, res) => {
	try {
		const transfer = await Transfer.findById(req.params.id);

		if (!transfer) {
			return res.status(404).json({ error: "Transfer request not found" });
		}

		res.json(transfer);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

exports.createTransfer = async (req, res) => {
	try {
		const transfer = await Transfer.create(req.body);
		res.status(201).json(transfer);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

exports.updateTransfer = async (req, res) => {
	try {
		const transfer = await Transfer.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});

		if (!transfer) {
			return res.status(404).json({ error: "Transfer request not found" });
		}

		res.json(transfer);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

exports.deleteTransfer = async (req, res) => {
	try {
		const deletedTransfer = await Transfer.findByIdAndDelete(req.params.id);

		if (!deletedTransfer) {
			return res.status(404).json({ error: "Transfer request not found" });
		}

		res.json({ message: "Transfer request deleted successfully" });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};
