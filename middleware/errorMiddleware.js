// Middleware to handle 404 Not Found errors
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Middleware to handle errors and send appropriate response
const errorHandler = (err, req, res, next) => {
  // Determine the status code based on the response's current status code
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Set the response status code
  res.status(statusCode);

  // Send a JSON response with error message and stack trace (in development)
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler }; // Export the error handling middleware
