export const errorHandler = (err, req, res, next) => {
  console.error("[ServerError]", err);
  const statusCode = err.statusCode || res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || "An unexpected server error occurred",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
};
