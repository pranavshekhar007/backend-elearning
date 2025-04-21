const express = require("express");
const { sendResponse } = require("../utils/common");
require("dotenv").config();
const Material = require("../model/material.Schema");
const materialController = express.Router();
require("dotenv").config();
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");

materialController.post("/create", upload.single("pdfLink"), async (req, res) => {
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
        obj = { ...req.body, pdfLink: image.url };
      }
      const MaterialCreated = await Material.create(obj);
      sendResponse(res, 200, "Success", {
        message: "Material created successfully!",
        data: MaterialCreated,
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
// topicController.get("/list/user/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const addressList = await Address.find({ userId: id });
//     sendResponse(res, 200, "Success", {
//       message: "Address list retrived successfully!",
//       data: addressList,
//       statusCode: 200,
//     });
//   } catch (error) {
//     console.error(error);
//     sendResponse(res, 500, "Failed", {
//       message: error.message || "Internal server error",
//       statusCode: 200,
//     });
//   }
// });
// topicController.put("/update", async (req, res) => {
//   try {
//     const id = req.body._id;
//     const address = await Address.findById(id);
//     if (!address) {
//       return sendResponse(res, 404, "Failed", {
//         message: "Address not found",
//         statusCode: 403,
//       });
//     }
//     const updatedAddress = await Address.findByIdAndUpdate(id, req.body, {
//       new: true, 
//     });

//     sendResponse(res, 200, "Success", {
//       message: "Address updated successfully!",
//       data: updatedAddress,
//       statusCode: 200,
//     });
//   } catch (error) {
//     console.error(error);
//     sendResponse(res, 500, "Failed", {
//       message: error.message || "Internal server error",
//       statusCode: 500,
//     });
//   }
// });
// topicController.delete("/delete/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const address = await Address.findById(id);
//     if (!address) {
//       return sendResponse(res, 404, "Failed", {
//         message: "Address not found",
//       });
//     }
//     await Address.findByIdAndDelete(id);
//     sendResponse(res, 200, "Success", {
//       message: "Address  deleted successfully!",
//       statusCode: 200,
//     });
//   } catch (error) {
//     console.error(error);
//     sendResponse(res, 500, "Failed", {
//       message: error.message || "Internal server error",
//       statusCode: 200,
//     });
//   }
// });

module.exports = materialController;
