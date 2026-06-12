const router = require("express").Router();
const { protect } = require("../middlewares/auth.middleware");
const {
  getAllCourses,
  getCourseById,
  enrollInCourse,
  updateProgress,
  addCourse
} = require("../controllers/courses.controller");

router.use(protect);

router.get("/", getAllCourses);
router.get("/:courseId", getCourseById);
router.post("/:courseId/enroll", enrollInCourse);
router.put("/:courseId/progress", updateProgress);
router.post("/", addCourse);

module.exports = router;
