const express = require("express");
const { sendResponse } = require("../utils/common");
const Course = require("../model/course.Schema");
const courseController = express.Router();
require("dotenv").config();
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");
const Topic = require("../model/topic.Schema");

courseController.post("/create", upload.single("image"), async (req, res) => {
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
    const CourseCreated = await Course.create(obj);
    sendResponse(res, 200, "Success", {
      message: "Course created successfully!",
      data: CourseCreated,
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
courseController.post("/list", async (req, res) => {
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
    const courseList = await Course.find(query)
      .populate("categoryId", "name")
      .sort(sortOption)
      .limit(parseInt(pageCount))
      .skip(parseInt(pageNo - 1) * parseInt(pageCount));
    const totalCount = await Course.countDocuments({});
    const activeCount = await Course.countDocuments({ status: true });
    sendResponse(res, 200, "Success", {
      message: "Course list retrieved successfully!",
      data: courseList,
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
courseController.put(
  "/update/:id",
  upload.single("image"),
  async (req, res) => {
    try {
      const id = req.params.id;
      const course = await Course.findById(id);
      if (!course) {
        return sendResponse(res, 404, "Failed", {
          message: "Course not found",
          statusCode: 404,
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
      const updatedCourse = await Course.findByIdAndUpdate(id, updatedData, {
        new: true, // Return the updated document
      });
      sendResponse(res, 200, "Success", {
        message: "Course updated successfully!",
        data: updatedCourse,
        statusCode: 200,
      });
    } catch (error) {
      sendResponse(res, 500, "Failed", {
        message: error.message || "Internal server error",
        statusCode: 500,
      });
    }
  }
);
courseController.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course) {
      return sendResponse(res, 404, "Failed", {
        message: "Course not found",
        statusCode: 404,
      });
    }
    const imageUrl = course.image;
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
    await Course.findByIdAndDelete(id);
    sendResponse(res, 200, "Success", {
      message: "Course and associated image deleted successfully!",
      statusCode: 200,
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});
courseController.get("/details/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const CourseDetails = await Course.findOne({ _id: id })
    .populate("categoryId", "name");
    const TopicList = await Topic.find({ courseId: id });
    sendResponse(res, 200, "Success", {
      message: "Course details retrived successfully!",
      data: { CourseDetails, TopicList },
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

module.exports = courseController;
