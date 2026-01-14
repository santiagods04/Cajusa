const User = require('../models/user');
const ForbiddenError = require('../errors/ForbiddenError');

module.exports = (req, res, next) => {
  User.findById(req.user._id).select('role')
    .orFail()
    .then((user) => {
      if (user.role !== 'admin') throw new ForbiddenError('Acceso denegado');
      next();
    })
    .catch(next);
};
