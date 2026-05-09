const fs = require('fs');
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  fs.appendFileSync('backend_errors.log', `${new Date().toISOString()} - ${err.stack}\n\n`);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'SERVER_ERROR',
      message: message,
    }
  });
};

module.exports = { errorHandler };
