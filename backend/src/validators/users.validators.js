const { z } = require("zod");

const updateMeSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).max(80).optional(),
    bio: z.string().max(500).optional(),
    phone: z.string().max(30).optional(),
  }),
});

module.exports = { updateMeSchema };
