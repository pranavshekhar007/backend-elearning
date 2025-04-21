const express = require("express");
const { sendResponse } = require("../utils/common");
require("dotenv").config();
const CurrentAffaires = require("../model/currentAffaires.Schema");
const currentAffairesController = express.Router();
require("dotenv").config();
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");

currentAffairesController.post("/create", upload.single("image"), async (req, res) => {
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
    const currentAffairCreated = await CurrentAffaires.create(obj);
    sendResponse(res, 200, "Success", {
      message: "Current Affair created successfully!",
      data: currentAffairCreated,
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
currentAffairesController.post("/list", async (req, res) => {
  try {
    const {
      category,
      pageNo=1, 
      pageCount = 10,
      sortByField, 
      sortByOrder
    } = req.body;
    const query = {};
    if (category) query.category = category; 
    const sortField = sortByField || "createdAt"; 
    const sortOrder = sortByOrder === "asc" ? 1 : -1; 
    const sortOption = { [sortField]: sortOrder };
    const currentAffairList = await CurrentAffaires.find(query)
      .sort(sortOption)
      .limit(parseInt(pageCount))
      .skip(parseInt(pageNo-1) * parseInt(pageCount)); 
    sendResponse(res, 200, "Success", {
      message: "Current Affair list retrieved successfully!",
      data: currentAffairList,
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
// currentAffairesController.delete("/delete/:id", async (req, res) => {
//     try {
//       const { id } = req.params;
//       const banner = await Banner.findById(id);
//       if (!banner) {
//         return sendResponse(res, 404, "Failed", {
//           message: "Banner not found",
//         });
//       }
//       const imageUrl = banner.image;
//       if (imageUrl) {
//         const publicId = imageUrl.split("/").pop().split(".")[0]; // Extract public ID
//         // Delete the image from Cloudinary
//         await cloudinary.uploader.destroy(publicId, (error, result) => {
//           if (error) {
//             console.error("Error deleting image from Cloudinary:", error);
//           } else {
//             console.log("Cloudinary image deletion result:", result);
//           }
//         });
//       }
//       await Banner.findByIdAndDelete(id);
//       sendResponse(res, 200, "Success", {
//         message: "Banner and associated image deleted successfully!",
//         statusCode:200
//       });
//     } catch (error) {
//       console.error(error);
//       sendResponse(res, 500, "Failed", {
//         message: error.message || "Internal server error",
//       });
//     }
// });

module.exports = currentAffairesController;
