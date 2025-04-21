const express = require("express");
const { sendResponse } = require("../utils/common");
require("dotenv").config();
const AcedemyBatch = require("../model/academyBatch.Schema");
const academyBatchController = express.Router();
require("dotenv").config();
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");
const SubCategory = require("../model/subCategory.Schema");

academyBatchController.post("/create", upload.single("image"), async (req, res) => {
  try {
    let obj;
    if (req.file) {
      let image = await cloudinary.uploader.upload(req.file.path, function (err, result) {
        if (err) {
          return err;
        } else {
          return result;
        }
      });
      obj = { ...req.body, image: image.url };
    }
    const batchCreated = await AcedemyBatch.create(obj);
    sendResponse(res, 200, "Success", {
      message: "Batch created successfully!",
      data: batchCreated,
      statusCode:200
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
      statusCode:500
    });
  }
});
academyBatchController.post("/list", async (req, res) => {
  try {
    const {
      searchKey = "", 
      status, 
      pageNo=1, 
      pageCount = 10,
      sortByField, 
      sortByOrder, 
      type
    } = req.body;
    const query = {};
    if (status) query.status = status; 
    if (type) query.type = type; 
    if (searchKey) query.name = { $regex: searchKey, $options: "i" }; 
    const sortField = sortByField || "createdAt"; 
    const sortOrder = sortByOrder === "asc" ? 1 : -1; 
    const sortOption = { [sortField]: sortOrder };
    const batchList = await AcedemyBatch.find(query)
      .sort(sortOption)
      .limit(parseInt(pageCount))
      .skip(parseInt(pageNo-1) * parseInt(pageCount)); 
    const totalCount = await AcedemyBatch.countDocuments({});
    const activeCount = await AcedemyBatch.countDocuments({status:true});
    sendResponse(res, 200, "Success", {
      message: "Batch list retrieved successfully!",
      data: batchList,
      documentCount: {totalCount, activeCount, inactiveCount: totalCount-activeCount},
      statusCode:200
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
      statusCode:500
    });
  }
});
academyBatchController.put("/update", upload.single("image"), async (req, res) => {
    try {
      const  id  = req.body._id;
      const batch = await AcedemyBatch.findById(id);
      if (!batch) {
        return sendResponse(res, 404, "Failed", {
          message: "Batch not found",
          statusCode:403
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
      const updatedBatch = await AcedemyBatch.findByIdAndUpdate(id, updatedData, {
        new: true, // Return the updated document
      });
      sendResponse(res, 200, "Success", {
        message: "Batch updated successfully!",
        data: updatedBatch,
        statusCode:200
      });
    } catch (error) {
      sendResponse(res, 500, "Failed", {
        message: error.message || "Internal server error",
        statusCode:500
      });
    }
});
academyBatchController.delete("/delete/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const batch = await AcedemyBatch.findById(id);
      if (!batch) {
        return sendResponse(res, 404, "Failed", {
          message: "Batch not found",
        });
      }
      const imageUrl = category.image;
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
      await AcedemyBatch.findByIdAndDelete(id);
      sendResponse(res, 200, "Success", {
        message: "Batch and associated image deleted successfully!",
      });
    } catch (error) {
      console.error(error);
      sendResponse(res, 500, "Failed", {
        message: error.message || "Internal server error",
      });
    }
});
academyBatchController.get("/details/:id",  async (req, res) => {
  try {
    const { id } = req.params
    const BatchDetails = await AcedemyBatch.findOne({_id:id});
      if (!BatchDetails) {
        return sendResponse(res, 404, "Failed", {
          message: "Batch not found",
        });
      }
    sendResponse(res, 200, "Success", {
      message: "Batch Details Retrived Successfully",
      data:BatchDetails,
      statusCode:200
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
      statusCode:500
    });
  }
});

module.exports = academyBatchController;
