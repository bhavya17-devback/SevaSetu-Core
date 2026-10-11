const donationService = require("./donation.service");

const getUserId = (req) => (req.user ? req.user._id || req.user.id : null);

const create = async (req, res) => {
  try {
    const donation = await donationService.createDonation(req.body, getUserId(req));
    res.status(201).json({
      success: true,
      message: "Donation created successfully",
      data: donation,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getAll = async (req, res) => {
  try {
    const donations = await donationService.getAllDonations(req.query);
    res.status(200).json({ success: true, data: donations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const search = async (req, res) => {
  try {
    const keyword = req.query.q || "";
    const donations = await donationService.searchDonations(keyword);
    res.status(200).json({ success: true, data: donations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMy = async (req, res) => {
  try {
    const donations = await donationService.getMyDonations(getUserId(req));
    res.status(200).json({ success: true, data: donations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const claim = async (req, res) => {
  try {
    const donation = await donationService.claimDonation(req.params.id, getUserId(req));
    res.status(200).json({
      success: true,
      message: "Donation claimed successfully",
      data: donation,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getMyClaims = async (req, res) => {
  try {
    const donations = await donationService.getMyClaims(getUserId(req));
    res.status(200).json({ success: true, data: donations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const cancel = async (req, res) => {
  try {
    const donation = await donationService.cancelDonation(req.params.id, getUserId(req));
    res.status(200).json({
      success: true,
      message: "Donation cancelled successfully",
      data: donation,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const remove = async (req, res) => {
  try {
    await donationService.deleteDonation(req.params.id, getUserId(req));
    res.status(200).json({ success: true, message: "Donation deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  create,
  getAll,
  search,
  getMy,
  claim,
  getMyClaims,
  cancel,
  remove,
};