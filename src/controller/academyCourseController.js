const express = require("express");
const { sendResponse } = require("../utils/common");
require("dotenv").config();
const AcademyCourse = require("../model/academyCourse.Schema");
const academyCourseController = express.Router();
require("dotenv").config();
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");
const Topic = require("../model/topic.Schema");
const Material = require("../model/material.Schema");

academyCourseController.post("/create", upload.single("image"), async (req, res) => {
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
    const AcademyCourseCreated = await AcademyCourse.create(obj);
    sendResponse(res, 200, "Success", {
      message: "Academy course created successfully!",
      data: AcademyCourseCreated,
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
academyCourseController.post("/list", async (req, res) => {
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
    const courseList = await AcademyCourse.find(query)
      .populate("categoryId", "name")
      .sort(sortOption)
      .limit(parseInt(pageCount))
      .skip(parseInt(pageNo-1) * parseInt(pageCount)); 
    const totalCount = await AcademyCourse.countDocuments({});
    const activeCount = await AcademyCourse.countDocuments({status:true});
    sendResponse(res, 200, "Success", {
      message: "Academy Course list retrieved successfully!",
      data: courseList,
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
academyCourseController.put("/update/:id", upload.single("image"), async (req, res) => {
    try {
      const  id  = req.params.id;
      const course = await AcademyCourse.findById(id);
      if (!course) {
        return sendResponse(res, 404, "Failed", {
          message: "Course not found",
          statusCode:403
        });
      }
      let updatedData = { ...req.body };
      if (req.file) {
        // Delete the old image from Cloudinary
        if (course.image) {
          const publicId = course.image.split("/").pop().split(".")[0];
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
      const updatedCourse = await AcademyCourse.findByIdAndUpdate(id, updatedData, {
        new: true, // Return the updated document
      });
      sendResponse(res, 200, "Success", {
        message: "Academy Course updated successfully!",
        data: updatedCourse,
        statusCode:200
      });
    } catch (error) {
      sendResponse(res, 500, "Failed", {
        message: error.message || "Internal server error",
        statusCode:500
      });
    }
});
academyCourseController.delete("/delete/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const academyCourse = await AcademyCourse.findById(id);
      if (!academyCourse) {
        return sendResponse(res, 404, "Failed", {
          message: "Academy course not found",
        });
      }
      const imageUrl = academyCourse.image;
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
      await AcademyCourse.findByIdAndDelete(id);
      sendResponse(res, 200, "Success", {
        message: "Academy course deleted successfully!",
        statusCode: 200,
      });
    } catch (error) {
      console.error(error);
      sendResponse(res, 500, "Failed", {
        message: error.message || "Internal server error",
      });
    }
});
academyCourseController.get("/details/:id",  async (req, res) => {
  try {
    const { id } = req.params
    const CourseDetails = await AcademyCourse.findOne({_id:id})
    .populate("categoryId", "name");;
    const TopicList = await Topic.find({courseId:id});
    const MaterialList = await Material.find({academyCourseId:id});
    sendResponse(res, 200, "Success", {
      message: "Academy Course details retrived successfully!",
      data:{CourseDetails, TopicList, MaterialList},
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

module.exports = academyCourseController;
