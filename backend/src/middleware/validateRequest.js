const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      // 1. Handling Zod Schema
      if (schema && typeof schema.parse === "function") {
        // Zod issue schema: schema directly validates req.body OR { body: req.body }
        schema.parse({
          body: req.body,
          query: req.query,
          params: req.params,
        });
        return next();
      }

      // 2. Handling Joi Schema
      if (schema && typeof schema.validate === "function") {
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
          const details = Array.isArray(error.details)
            ? error.details.map((d) => d.message)
            : [error.message];

          return res.status(400).json({
            success: false,
            message: "Validation Error",
            errors: details,
          });
        }
        req.body = value;
        return next();
      }

      next();
    } catch (error) {
      let errorMessages = ["Invalid input data"];

      // Parse Zod errors cleanly
      if (error && Array.isArray(error.errors)) {
        errorMessages = error.errors.map(
          (err) => `${err.path ? err.path.join(".") + ": " : ""}${err.message}`
        );
      } else if (error && error.message) {
        try {
          const parsed = JSON.parse(error.message);
          if (Array.isArray(parsed)) {
            errorMessages = parsed.map(
              (err) => `${err.path ? err.path.join(".") + ": " : ""}${err.message}`
            );
          } else {
            errorMessages = [error.message];
          }
        } catch (e) {
          errorMessages = [error.message];
        }
      }

      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: errorMessages,
      });
    }
  };
};

module.exports = validateRequest;