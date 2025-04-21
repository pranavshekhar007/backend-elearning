const express = require("express");
const { sendResponse } = require("../utils/common");
require("dotenv").config();
const Batch = require("../model/batch.Schema");
const batchController = express.Router();
require("dotenv").config();
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");
const SubCategory = require("../model/subCategory.Schema");

batchController.post("/create", upload.single("image"), async (req, res) => {
  try {
    let obj;
    if (req.file) {
      let image = await cloudinary.uploader.upload(
        req.file.path,
        function (err, result) {
          if (err) {
            return err;
          } else {
            return result;
          }
        }
      );
      obj = { ...req.body, image: image.url };
    }
    const batchCreated = await Batch.create(obj);
    sendResponse(res, 200, "Success", {
      message: "Batch created successfully!",
      data: batchCreated,
      statusCode: 200,
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
      statusCode: 500,
    });
  }
});
batchController.post("/list", async (req, res) => {
  try {
    const {
      searchKey = "",
      status,
      pageNo = 1,
      pageCount = 10,
      sortByField,
      sortByOrder,
      type,
    } = req.body;
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (searchKey) query.name = { $regex: searchKey, $options: "i" };
    const sortField = sortByField || "createdAt";
    const sortOrder = sortByOrder === "asc" ? 1 : -1;
    const sortOption = { [sortField]: sortOrder };
    const batchList = await Batch.find(query)
      .populate("categoryId", "name")
      .sort(sortOption)
      .limit(parseInt(pageCount))
      .skip(parseInt(pageNo - 1) * parseInt(pageCount));
    const totalCount = await Batch.countDocuments({});
    const activeCount = await Batch.countDocuments({ status: true });
    sendResponse(res, 200, "Success", {
      message: "Batch list retrieved successfully!",
      data: batchList,
      documentCount: {
        totalCount,
        activeCount,
        inactiveCount: totalCount - activeCount,
      },
      statusCode: 200,
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
      statusCode: 500,
    });
  }
});
batchController.put("/update/:id", upload.single("image"), async (req, res) => {
  try {
    const id = req.params.id;
    const batch = await Batch.findById(id);
    if (!batch) {
      return sendResponse(res, 404, "Failed", {
        message: "Batch not found",
        statusCode: 403,
      });
    }
    let updatedData = { ...req.body };
    if (req.file) {
      // Delete the old image from Cloudinary
      if (batch.image) {
        const publicId = batch.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId, (error, result) => {
          if (error) {
            console.error("Error deleting old image from Cloudinary:", error);
          } else {
            console.log("Old image deleted from Cloudinary:", result);
          }
        });
      }
      const image = await cloudinary.uploader.upload(req.file.path);
      updatedData.image = image.url;
    }
    const updatedBatch = await Batch.findByIdAndUpdate(id, updatedData, {
      new: true, // Return the updated document
    });
    sendResponse(res, 200, "Success", {
      message: "Batch updated successfully!",
      data: updatedBatch,
      statusCode: 200,
    });
  } catch (error) {
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
      statusCode: 500,
    });
  }
});
batchController.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const batch = await Batch.findById(id);
    if (!batch) {
      return sendResponse(res, 404, "Failed", {
        message: "Batch not found",
        statusCode: 404,
      });
    }
    const imageUrl = batch.image;
    if (imageUrl) {
      const publicId = imageUrl.split("/").pop().split(".")[0]; // Extract public ID
      // Delete the image from Cloudinary
      await cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          console.error("Error deleting image from Cloudinary:", error);
        } else {
          console.log("Cloudinary image deletion result:", result);
        }
      });
    }
    await Batch.findByIdAndDelete(id);
    sendResponse(res, 200, "Success", {
      message: "Batch and associated image deleted successfully!",
      statusCode: 200,
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});
batchController.get("/details/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const BatchDetails = await Batch.findOne({ _id: id })
    .populate("categoryId", "name");
    if (!BatchDetails) {
      return sendResponse(res, 404, "Failed", {
        message: "Batch not found",
      });
    }
    sendResponse(res, 200, "Success", {
      message: "Batch Details Retrived Successfully",
      data: BatchDetails,
      statusCode: 200,
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
      statusCode: 500,
    });
  }
});

module.exports = batchController;
