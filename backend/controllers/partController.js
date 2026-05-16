const Part = require('../models/Part');

exports.createPart = async (req, res) => {
    try {
        const part = await Part.create(req.body);
        res.status(201).json(part);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.importParts = async (req, res) => {
    try {
        const partsData = req.body;
        if (!Array.isArray(partsData) || partsData.length === 0) {
            return res.status(400).json({ message: 'Invalid or empty parts data array' });
        }
        const importedParts = await Part.insertMany(partsData, { ordered: false });
        res.status(201).json({ message: `Successfully imported ${importedParts.length} parts`, importedCount: importedParts.length });
    } catch (error) {
        res.status(400).json({ message: error.message, details: error.writeErrors });
    }
};

exports.getParts = async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};
        if (search) {
            query = {
                $or: [
                    { partId: { $regex: search, $options: 'i' } },
                    { names: { $in: [new RegExp(search, 'i')] } },
                    { category: { $regex: search, $options: 'i' } },
                    { supplier: { $regex: search, $options: 'i' } }
                ]
            };
        }
        const parts = await Part.find(query).sort({ createdAt: -1 });
        res.json(parts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getPartById = async (req, res) => {
    try {
        const part = await Part.findById(req.params.id);
        if (!part) return res.status(404).json({ message: 'Part not found' });
        res.json(part);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updatePart = async (req, res) => {
    try {
        const part = await Part.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!part) return res.status(404).json({ message: 'Part not found' });
        res.json(part);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deletePart = async (req, res) => {
    try {
        const part = await Part.findByIdAndDelete(req.params.id);
        if (!part) return res.status(404).json({ message: 'Part not found' });
        res.json({ message: 'Part removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAnalytics = async (req, res) => {
    try {
        const totalParts = await Part.countDocuments();
        const totalValueData = await Part.aggregate([
            { $group: { _id: null, total: { $sum: "$totalPrice" } } }
        ]);
        const lowStockParts = await Part.find({ $expr: { $lte: ["$quantity", "$minStockThreshold"] } });
        const outOfStockParts = await Part.find({ quantity: 0 });
        const recentlyAdded = await Part.find().sort({ createdAt: -1 }).limit(5);

        res.json({
            totalParts,
            totalValue: totalValueData[0] ? totalValueData[0].total : 0,
            lowStockCount: lowStockParts.length,
            outOfStockCount: outOfStockParts.length,
            recentlyAdded,
            lowStockItems: lowStockParts
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
