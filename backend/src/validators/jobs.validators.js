const { z } = require("zod");

const createJobSchema = z.object({
  body: z.object({
    title: z.string().min(2).max(120),
    description: z.string().min(20).max(10000),
    location: z.string().max(120).optional(),
    jobType: z.enum(["full_time", "part_time", "internship", "contract"]).optional(),
    requiredSkills: z.array(z.string().min(1)).default([]),
    status: z.enum(["open", "closed", "on_hold", "filled"]).optional(),
  }),
});

const updateJobSchema = z.object({
  body: z.object({
    title: z.string().min(2).max(120).optional(),
    description: z.string().min(20).max(10000).optional(),
    location: z.string().max(120).optional(),
    jobType: z.enum(["full_time", "part_time", "internship", "contract"]).optional(),
    requiredSkills: z.array(z.string().min(1)).optional(),
    status: z.enum(["open", "closed", "on_hold", "filled"]).optional(),
  }),
});

module.exports = { createJobSchema, updateJobSchema };
