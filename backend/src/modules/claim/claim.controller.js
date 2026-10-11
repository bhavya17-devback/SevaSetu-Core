const claimService = require("./claim.service");

const claim = async (req, res) => {
  try {
    const { donationId } = req.body;
    const result = await claimService.claimDonation(donationId, req.user.id);
    res.status(200).json({
      success: true,
      message: "Donation claimed successfully",
      data: result,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getMyClaims = async (req, res) => {
  try {
    const claims = await claimService.getMyClaims(req.user.id);
    res.status(200).json({ success: true, data: claims });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, otp } = req.body;
    const result = await claimService.updateClaimStatus(
      id,
      status,
      req.user.id,
      otp
    );
    res.status(200).json({
      success: true,
      message: "Status updated successfully",
      data: result,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  claim,
  getMyClaims,
  updateStatus,
};