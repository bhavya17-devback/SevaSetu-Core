const reportService = require("./report.service");

const create = async (req, res) => {
  try {
    const report = await reportService.createReport(req.body, req.user.id);
    res.status(201).json({
      success: true,
      message: "Report submitted successfully",
      data: report,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getAll = async (req, res) => {
  try {
    const reports = await reportService.getAllReports();
    res.status(200).json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const report = await reportService.updateReportStatus(
      req.params.id,
      req.body.status
    );
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  create,
  getAll,
  updateStatus,
};