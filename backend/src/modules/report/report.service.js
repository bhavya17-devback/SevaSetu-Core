const Donation = require("../../models/Donation");
const Report = require("../../models/Report");

const createReport = async (reportData, userId) => {
  const { donationId, reason, description } = reportData;

  const donation = await Donation.findById(donationId);
  if (!donation) {
    throw new Error("Donation not found");
  }

  const report = await Report.create({
    donation: donationId,
    reportedBy: userId,
    reason,
    description,
  });

  return report;
};

const getAllReports = async () => {
  return await Report.find()
    .sort({ createdAt: -1 })
    .populate("donation", "itemName category city status")
    .populate("reportedBy", "name email role");
};

const updateReportStatus = async (reportId, status) => {
  const report = await Report.findByIdAndUpdate(
    reportId,
    { status },
    { new: true }
  );
  if (!report) {
    throw new Error("Report not found");
  }
  return report;
};

module.exports = {
  createReport,
  getAllReports,
  updateReportStatus,
};
