const express = require("express");
const jwt = require("jsonwebtoken");
const Admin = require("../model/admin.Schema");
const { sendResponse } = require("../utils/common");
const adminController = express.Router();

// Create (Sign-Up)
adminController.post("/create", async (req, res) => {
  try {
    const existingAdmin = await Admin.findOne({ email: req.body.email });
    if (existingAdmin) {
      return sendResponse(res, 400, "Failed", {
        message: "Email already registered",
        statusCode: 400,
      });
    }

    const admin = await Admin.create(req.body);
    sendResponse(res, 201, "Success", {
      message: "Admin registered successfully",
      data: admin,
      statusCode: 201,
    });
  } catch (error) {
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal Server Error",
      statusCode: 500,
    });
  }
});

// Login
adminController.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email, password });

    if (!admin) {
      return sendResponse(res, 401, "Failed", {
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { adminId: admin._id, role: admin.role },
      process.env.JWT_KEY,
      { expiresIn: "1d" }
    );

    admin.token = token;
    await admin.save();

    sendResponse(res, 200, "Success", {
      message: "Admin logged in successfully",
      data: admin,
      statusCode: 200,
    });
  } catch (error) {
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal Server Error",
      statusCode: 500,
    });
  }
});

// Get All Admins
adminController.get("/list", async (req, res) => {
  try {
    const {
      searchKey = "",
      sortByField = "createdAt",
      sortOrder = "-1",
      role = "",
    } = req.query;

    const sort = {};
    if (sortByField) {
      sort[sortByField] = parseInt(sortOrder);
    }

    const query = {};
    if (role) {
      query.role = role;
    }
    if (searchKey) {
      query.$or = [
        { firstName: { $regex: searchKey, $options: "i" } },
        { lastName: { $regex: searchKey, $options: "i" } },
        { email: { $regex: searchKey, $options: "i" } },
      ];
    }
    const totalAdmin = await Admin.countDocuments({});
    const superAdmin = await Admin.countDocuments({ role: "superadmin" });
    const supervisor = await Admin.countDocuments({ role: "supervisor" });
    const admin = await Admin.countDocuments({ role: "admin" });
    const admins = await Admin.find(query).sort(sort);
    sendResponse(res, 200, "Success", {
      message: "Admin list retrieved",
      data: admins,
      documentCount: {totalAdmin, superAdmin, supervisor, admin},
      statusCode: 200,
    });
  } catch (error) {
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal Server Error",
      statusCode: 500,
    });
  }
});

// Get Admin Details
adminController.get("/details/:id", async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return sendResponse(res, 404, "Failed", {
        message: "Admin not found",
      });
    }
    sendResponse(res, 200, "Success", {
      message: "Admin details retrieved",
      data: admin,
      statusCode: 200,
    });
  } catch (error) {
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal Server Error",
      statusCode: 500,
    });
  }
});

// Update Admin
adminController.put("/update/:id", async (req, res) => {
  try {
    const admin = await Admin.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!admin) {
      return sendResponse(res, 404, "Failed", {
        message: "Admin not found",
        statusCode: 404,
      });
    }
    sendResponse(res, 200, "Success", {
      message: "Admin updated successfully",
      data: admin,
      statusCode: 200,
    });
  } catch (error) {
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal Server Error",
      statusCode: 500,
    });
  }
});

// Delete Admin
adminController.delete("/delete/:id", async (req, res) => {
  try {
    const admin = await Admin.findByIdAndDelete(req.params.id);
    if (!admin) {
      return sendResponse(res, 404, "Failed", {
        message: "Admin not found",
        statusCode: 404,
      });
    }
    sendResponse(res, 200, "Success", {
      message: "Admin deleted successfully",
      statusCode: 200,
    });
  } catch (error) {
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal Server Error",
      statusCode: 500,
    });
  }
});

module.exports = adminController;
