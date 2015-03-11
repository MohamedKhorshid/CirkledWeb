/**
 * `ValidationError` error.
 *
 * @api public
 */
function ValidationError(details) {
  Error.call(this);
  Error.captureStackTrace(this, arguments.callee);
  this.name = 'ValidationError';
  this.message = "Validation failed";
  this.details = details;
}

/**
 * Inherit from `Error`.
 */
ValidationError.prototype.__proto__ = Error.prototype;

/**
 * Expose `ValidationError`.
 */
module.exports = ValidationError;
