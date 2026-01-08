// 1. Handle "404 Not Found" (Prevent HTML responses for missing API routes)
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// 2. Global Error Handler (Stops server crashes)
const errorHandler = (err, req, res, next) => {
  // If status is 200 (success) but there's an error, force it to 500 (server error)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode);
  
  res.json({
    message: err.message,
    // Only show stack trace in development mode for safety
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler };