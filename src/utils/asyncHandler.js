const asyncHandler = (fun) => {
  (req, res, next) => {
    Promise.resolve(fun(req, res, next)).catch((err) => next(err));
  };
};
module.exports = asyncHandler;
