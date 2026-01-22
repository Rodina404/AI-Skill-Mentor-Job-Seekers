const { ApiError } = require("../utils/apiError");

function validate(schema) {
  return (req, _res, next) => {
    const parsed = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!parsed.success) {
      return next(new ApiError(400, "Validation error", parsed.error.flatten()));
    }
    next();
  };
}

module.exports = { validate };
