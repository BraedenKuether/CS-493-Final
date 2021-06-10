const jwt = require('jsonwebtoken');

const secretKey = 'SuperSecret';

// function generateAuthToken(id) {
//   return new Promise((resolve, reject) => {
//     const payload = { sub: id };
//     jwt.sign(payload, secretKey, { expiresIn: '24h' }, function (err, token) {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(token);
//       }
//     });
//   });
// }

function generateAuthToken(userId) {
  const payload = { sub: userId };
  return jwt.sign(payload, secretKey, { expiresIn: '24h' });
}
exports.generateAuthToken = generateAuthToken;

function requireAuthentication (req, res, next) {
  const authHeader = req.get('Authorization') || '';
  const authHeaderParts = authHeader.split(' ');
  const token = authHeaderParts[0] === 'Bearer' ? authHeaderParts[1] : null;
  jwt.verify(token, secretKey, function (err, payload) {
    if (!err) {
      req.user = payload.sub;
      next();
    } else {
	console.error(err);
      res.status(401).json({
        error: "Invalid authentication token"
      });
    }
  });
}

exports.generateAuthToken = generateAuthToken;
exports.requireAuthentication = requireAuthentication;
