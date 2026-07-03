const router = require("express").Router();
const { protect } = require("../middlewares/auth.middleware");
const {
  getAllCourses,
  getCourseById,
  enrollInCourse,
  updateProgress,
  addCourse,
  explainCourse
} = require("../controllers/courses.controller");

router.use(protect);

router.get("/", getAllCourses);
router.get("/:courseId", getCourseById);
router.post("/:courseId/enroll", enrollInCourse);
router.put("/:courseId/progress", updateProgress);
router.post("/:courseId/explain", explainCourse);
router.post("/", addCourse);

module.exports = router;
