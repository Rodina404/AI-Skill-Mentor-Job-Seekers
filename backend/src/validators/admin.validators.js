const { z } = require("zod");

const objectId = z
  .string()
  .trim()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

const listUsersSchema = z.object({
  query: z.object({
    role: z.enum(["job_seeker", "recruiter", "admin"]).optional(),
    isActive: z
      .enum(["true", "false"])
      .optional()
      .transform((v) => (v === undefined ? undefined : v === "true")),
    q: z.string().trim().min(1).max(120).optional(), // search by email
    page: z
      .string()
      .optional()
      .transform((v) => (v ? Number(v) : 1)),
    limit: z
      .string()
      .optional()
      .transform((v) => (v ? Math.min(Number(v), 100) : 20)),
  }),
});

const deactivateUserSchema = z.object({
  params: z.object({
    userId: objectId,
  }),
});

const listAllJobsSchema = z.object({
  query: z.object({
    status: z.enum(["open", "closed", "on_hold", "filled"]).optional(),
    q: z.string().trim().min(1).max(120).optional(), // search by title/company
    page: z
      .string()
      .optional()
      .transform((v) => (v ? Number(v) : 1)),
    limit: z
      .string()
      .optional()
      .transform((v) => (v ? Math.min(Number(v), 100) : 20)),
  }),
});

const deleteJobSchema = z.object({
  params: z.object({
    jobId: objectId,
  }),
});

module.exports = {
  listUsersSchema,
  deactivateUserSchema,
  listAllJobsSchema,
  deleteJobSchema,
};
