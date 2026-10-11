const User = require("../../models/User");
const adminService = require("./admin.service");
const bcrypt = require("bcryptjs");
const { signToken } = require("../../utils/token");

// 14. POST Admin Register
const register = async (req, res) => {
  try {
    const admin = await adminService.registerAdmin(req.body);
    res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      data: admin,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 15. POST Admin Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: String(email).trim().toLowerCase() });
    if (!user || String(user.role).toLowerCase() !== "admin") {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials or user is not an Admin" 
      });
    }

    let isMatch = false;
    if (typeof user.comparePassword === "function") {
      isMatch = await user.comparePassword(password);
    } else if (typeof user.matchPassword === "function") {
      isMatch = await user.matchPassword(password);
    } else {
      isMatch = await bcrypt.compare(password, user.password);
    }

    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    if (user.status && user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "This admin account is not active.",
      });
    }

    const token = signToken(user, "1d");

    res.status(200).json({
      success: true,
      message: "Admin logged in successfully",
      token,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 16. PUT Gatekeeping Barrier Check
const gatekeeperCheck = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Gatekeeping barrier passed. Admin access verified.",
      admin: req.user,
    });
  } catch (error) {
    res.status(403).json({ success: false, message: error.message });
  }
};

// 17. GET Pending List NGO
const getPendingNgos = async (req, res) => {
  try {
    const ngos = await adminService.getPendingNgos();
    res.status(200).json({ success: true, data: ngos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 18. PUT NGO Status Approve
const approveNgo = async (req, res) => {
  try {
    const { id } = req.params;
    const ngo = await adminService.updateNgoStatus(id, "Approved");
    res.status(200).json({
      success: true,
      message: "NGO approved successfully",
      data: ngo,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 19. PUT Claim Donation Test (Admin)
const claimDonation = async (req, res) => {
  try {
    const adminId = req.user._id || req.user.id;
    const donation = await adminService.adminClaimDonation(req.params.id, adminId);
    res.status(200).json({
      success: true,
      message: "Donation claimed by Admin successfully",
      data: donation,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 20. GET Analytics & Reports Test
const getAnalytics = async (req, res) => {
  try {
    const stats = await adminService.getPlatformStats();
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 21. GET Fetch All Users Test
const getAllUsers = async (req, res) => {
  try {
    const users = await adminService.getAllUsers();
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 22. PATCH Update User Status Test
const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const user = await adminService.updateUserStatus(req.params.id, status);
    res.status(200).json({
      success: true,
      message: "User status updated successfully",
      data: user,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 23. DEL Delete User Test
const deleteUser = async (req, res) => {
  try {
    await adminService.deleteUser(req.params.id);
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// GET every donation on the platform, any status (admin moderation view)
const getAllDonations = async (req, res) => {
  try {
    const donations = await adminService.getAllDonationsForAdmin();
    res.status(200).json({ success: true, data: donations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH take a donation off the platform without deleting it
const cancelDonation = async (req, res) => {
  try {
    const donation = await adminService.cancelDonationAsAdmin(req.params.id);
    res.status(200).json({
      success: true,
      message: "Donation cancelled successfully",
      data: donation,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DEL permanently remove a donation listing
const deleteDonation = async (req, res) => {
  try {
    await adminService.deleteDonationAsAdmin(req.params.id);
    res.status(200).json({ success: true, message: "Donation deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  register,
  login,
  gatekeeperCheck,
  getPendingNgos,
  approveNgo,
  claimDonation,
  getAnalytics,
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getAllDonations,
  cancelDonation,
  deleteDonation,
};