const express = require("express");
const { sendResponse } = require("../utils/common");
require("dotenv").config();
const Category = require("../model/category.Schema");
const Course = require("../model/course.Schema");
const Batch = require("../model/batch.Schema");
const AcademyBatch = require("../model/academyBatch.Schema");
const AcademyCourse = require("../model/academyCourse.Schema");
const categoryController = express.Router();
require("dotenv").config();
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");
const SubCategory = require("../model/subCategory.Schema");

categoryController.post("/create", upload.single("image"), async (req, res) => {
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
    const CategoryCreated = await Category.create(obj);
    sendResponse(res, 200, "Success", {
      message: "Category created successfully!",
      data: CategoryCreated,
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
categoryController.post("/list", async (req, res) => {
  try {
    const {
      searchKey = "", 
      status, 
      pageNo=1, 
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
    const categoryList = await Category.find(query)
      .sort(sortOption)
      .limit(parseInt(pageCount))
      .skip(parseInt(pageNo-1) * parseInt(pageCount)); 
    const totalCount = await Category.countDocuments({});
    const activeCount = await Category.countDocuments({status:true});
    sendResponse(res, 200, "Success", {
      message: "Category list retrieved successfully!",
      data: categoryList,
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
categoryController.put("/update", upload.single("image"), async (req, res) => {
    try {
      const  id  = req.body._id;
      const category = await Category.findById(id);
      if (!category) {
        return sendResponse(res, 404, "Failed", {
          message: "Category not found",
          statusCode:403
        });
      }
      let updatedData = { ...req.body };
      if (req.file) {
        // Delete the old image from Cloudinary
        if (category.image) {
          const publicId = category.image.split("/").pop().split(".")[0];
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
      const updatedCategory = await Category.findByIdAndUpdate(id, updatedData, {
        new: true, // Return the updated document
      });
      sendResponse(res, 200, "Success", {
        message: "Category updated successfully!",
        data: updatedCategory,
        statusCode:200
      });
    } catch (error) {
      sendResponse(res, 500, "Failed", {
        message: error.message || "Internal server error",
        statusCode:500
      });
    }
});
categoryController.delete("/delete/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const category = await Category.findById(id);
      if (!category) {
        return sendResponse(res, 404, "Failed", {
          message: "Category not found",
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
      await Category.findByIdAndDelete(id);
      sendResponse(res, 200, "Success", {
        message: "Category and associated image deleted successfully!",
        statusCode:200,
      });
    } catch (error) {
      console.error(error);
      sendResponse(res, 500, "Failed", {
        message: error.message || "Internal server error",
        statusCode:500
      });
    }
});
categoryController.get("/details/:id",  async (req, res) => {
  try {
    const { id } = req.params
    const CategoryDetails = await Category.findOne({_id:id});
    const CourseList = await Course.find({categoryId:id});
    const BatchList = await Batch.find({categoryId:id});
    const AcademyBatchList = await AcademyBatch.find({categoryId:id});
    const AcademyCourseList = await AcademyCourse.find({categoryId:id});
    sendResponse(res, 200, "Success", {
      message: "Category with course list retrived successfully!",
      data:{CategoryDetails, CourseList, BatchList, AcademyBatchList, AcademyCourseList},
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

module.exports = categoryController;
