exports.errorHandler = (err, req, res, next) => {
    console.error(err.stack);
  
    // Default to 500 server error
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Server Error';
  
    // Handle specific error types
    if (err.name === 'ValidationError') {
      statusCode = 400;
      message = Object.values(err.errors).map(val => val.message).join(', ');
    } else if (err.name === 'CastError') {
      statusCode = 400;
      message = `Invalid ${err.path}: ${err.value}`;
    } else if (err.code === 11000) {
      statusCode = 400;
      message = `Duplicate field value: ${Object.keys(err.keyValue)}`;
    }
  
    res.status(statusCode).json({
      success: false,
      error: message
    });
  };