const { z } = require("zod");

const createApplicationSchema = z.object({
  body: z.object({
    jobPostingId: z.string().min(10),
    resumeId: z.string().min(10).optional(),
  }),
});

const updateApplicationStatusSchema = z.object({
  body: z.object({
    status: z.enum(["reviewed", "shortlisted", "rejected", "interview", "offered", "accepted", "declined"]),
    notes: z.string().max(2000).optional(),
  }),
});

module.exports = { createApplicationSchema, updateApplicationStatusSchema };
