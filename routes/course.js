import express from "express";
const router = express.Router();
import formidable from "express-formidable";
import { isInstructor, requireSignin, isEnrolled } from "../middleware";

const {
  courses,
  uploadImage,
  removeImage,
  create,
  read,
  uploadVideo,
  removeVideo,
  addLesson,
  update,
  removeLesson,
  updateLesson,
  publishCourse,
  unpublishCourse,
  checkEnrollment,
  freeEnrollment,
  paidEnrollment,
  stripeSuccess,
  userCourses,
  markCompleted,
  listCompleted,
  markIncomplete,
} = require("../controllers/course");

router.get("/courses", courses);
// for image
router.post("/course/upload-image", uploadImage);
router.post("/course/remove-image", removeImage);

//for course

router.post("/course", requireSignin, isInstructor, create);
router.put("/course/:slug", requireSignin, update);

// publish course
router.put("/course/publish/:courseId", requireSignin, publishCourse);
// unpublish course
router.put("/course/unpublish/:courseId", requireSignin, unpublishCourse);

// for lessons
router.put("/course/:slug/:lessonId", requireSignin, removeLesson);
router.put("/course/lesson/:slug/:lessonId", requireSignin, updateLesson);

router.get("/course/:slug", read);
router.post(
  "/course/video-upload/:instructorId",
  requireSignin,
  formidable({
    maxFileSize: 500 * 1024 * 1024,
  }),
  uploadVideo
);
router.post("/course/video-remove/:instructorId", requireSignin, removeVideo);
router.post("/course/lesson/:slug/:instructorId", requireSignin, addLesson);

// Entrollment Side
router.get("/check-enrollment/:courseId", requireSignin, checkEnrollment);

// enrollment
router.post("/free-enrollment/:courseId", requireSignin, freeEnrollment);
router.post("/paid-enrollment/:courseId", requireSignin, paidEnrollment);
router.get("/stripe-success/:courseId", requireSignin, stripeSuccess);

router.get("/user-courses", requireSignin, userCourses);

router.get("/user/course/:slug", requireSignin, isEnrolled, read);
router.post("/mark-completed", requireSignin, markCompleted);
router.post("/list-completed", requireSignin, listCompleted);
router.post("/mark-incomplete", requireSignin, markIncomplete);

module.exports = router;
