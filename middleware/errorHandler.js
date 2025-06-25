/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  // Check for Prisma-specific errors
  if (err.code && err.code.startsWith('P')) {
    // Handle Prisma errors
    switch (err.code) {
      case 'P2002': // Unique constraint violation
        return res.status(409).json({
          error: 'Conflict',
          message: 'A record with this data already exists'
        });
      case 'P2025': // Record not found
        return res.status(404).json({
          error: 'Not Found',
          message: 'The requested resource was not found'
        });
      default:
        break;
    }
  }
  
  // Default error response
  res.status(err.statusCode || 500).json({
    error: err.name || 'Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
};

/**
 * 404 Not Found handler for undefined routes
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Endpoint ${req.method} ${req.originalUrl} not found`
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
}; 