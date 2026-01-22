const router = require("express").Router();
const { authLimiter } = require("../middlewares/rateLimit.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { authenticate } = require("../middlewares/auth.middleware");
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require("../validators/auth.validators");
const { register, login, me, forgotPassword, resetPassword } = require("../controllers/auth.controller");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication APIs
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - role
 *               - fullName
 *             properties:
 *               email:
 *                 type: string
 *                 example: recruiter@test.com
 *               password:
 *                 type: string
 *                 example: Test12345678
 *               role:
 *                 type: string
 *                 enum: [job_seeker, recruiter, admin]
 *               fullName:
 *                 type: string
 *                 example: John Doe
 *     responses:
 *       201:
 *         description: User registered successfully
 *       409:
 *         description: Email already exists
 */

router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.get("/me", authenticate, me);

router.post("/forgot-password", authLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", authLimiter, validate(resetPasswordSchema), resetPassword);

module.exports = router;
