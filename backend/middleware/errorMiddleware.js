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
  
  // Handle multer errors specifically
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File too large. Maximum size is 5MB.',
        error: err.message,
      });
    }
    return res.status(400).json({
      message: 'File upload error: ' + err.message,
      error: err.message,
    });
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: err.message || 'Validation error',
      error: err.message,
    });
  }

  // Handle CastError (invalid MongoDB ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      message: 'Invalid ID format',
      error: err.message,
    });
  }
  
  res.status(statusCode);
  
  res.json({
    message: err.message || 'Server Error',
    // Only show stack trace in development mode for safety
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler };