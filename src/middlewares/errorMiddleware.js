const notFound = (req, res, next) => {
  const error = new Error(`Route Not Found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

//Error Handling
const HandlingError = (error, req, res, next) => {
  const statuscode = error.statusCode || 500;
  res.status(statuscode);
  res.json({
    status: false,
    message: error.message,
    stack: error.stack,
  });
};

module.exports = { HandlingError, notFound };
