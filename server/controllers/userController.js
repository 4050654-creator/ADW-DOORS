const getMe = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role,
        isActive: req.user.isActive,
        createdAt: req.user.createdAt,
      },
    });
  } catch (error) {
    console.error("Get me error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while getting user profile",
    });
  }
};

const getAdminDashboard = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Welcome to ADW STORE Admin Dashboard",
      admin: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } catch (error) {
    console.error("Admin dashboard error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  getMe,
  getAdminDashboard,
};