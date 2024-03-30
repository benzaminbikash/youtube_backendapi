class ApiResponse {
  constructor(statusCode, data, message) {
    (this.message = message),
      (this.status = statusCode < 400),
      (this.data = data);
  }
}

module.exports = ApiResponse;
