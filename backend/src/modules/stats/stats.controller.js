const statsService = require("./stats.service");

const getPublicStats = async (req, res) => {
  try {
    const stats = await statsService.getPublicStats();
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getPublicStats };
