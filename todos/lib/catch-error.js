// wrapper for async middleware. Eliminates need to catch errors.
const catchError = handler => { // handler is an async middleware
  return (req, res, next) => { // returns a new middleware
    Promise.resolve(handler(req, res, next)).catch(next); 
    // when called, invokes handler
    // Creates a "resolved Promise" that has the value returned by the original handler function.
    // If the handler function raises an exception, that exception gets caught by the Promise.prototype.catch call, which, in turn, dispatches the error via next(error).
  }; 
};

module.exports = catchError;