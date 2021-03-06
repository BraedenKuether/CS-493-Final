const express = require('express');
const morgan = require('morgan');
const redis = require('redis');
//const multer = require('multer');

const api = require('./api');
const { connectToDB } = require('./lib/mongo');
//const { connectToRabbitMQ, getChannel } = require('./lib/rabbit');

const app = express();
const port = process.env.PORT || 8000;

const redisClient = redis.createClient(
  process.env.REDIS_PORT || '6379',
  process.env.REDIS_HOST || 'redis'
);


const rateLimitWindowMS = 60000;
const rateLimitMaxRequests = 5;

function getUserTokenBucket(ip) {
  return new Promise((resolve, reject) => {
    redisClient.hgetall(ip, (err, tokenBucket) => {
      if (err) {
        reject(err);
      } else if (tokenBucket) {
        tokenBucket.tokens = parseFloat(tokenBucket.tokens);
        resolve(tokenBucket);
      } else {
        resolve({
          tokens: rateLimitMaxRequests,
          last: Date.now()
        });
      }
    });
  });
}

function saveUserTokenBucket(ip, tokenBucket) {
  return new Promise((resolve, reject) => {
    redisClient.hmset(ip, tokenBucket, (err, resp) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

async function rateLimit(req, res, next) {
  try {
    const tokenBucket = await getUserTokenBucket(req.ip);

    const currentTimestamp = Date.now();
    const ellapsedTime = currentTimestamp - tokenBucket.last;
    tokenBucket.tokens += ellapsedTime *
      (rateLimitMaxRequests / rateLimitWindowMS);
    tokenBucket.tokens = Math.min(
      tokenBucket.tokens,
      rateLimitMaxRequests
    );
    tokenBucket.last = currentTimestamp;

    if (tokenBucket.tokens >= 1) {
      tokenBucket.tokens -= 1;
      await saveUserTokenBucket(req.ip, tokenBucket);
      next();
    } else {
      res.status(429).send({
        error: "Too many request per minute.  Please wait a bit..."
      });
    }
  } catch (err) {
    console.log("Rate limiting broken")
    next();
  }
}

//const upload = multer({ dest: `${__dirname}/uploads` });

/*
 * Morgan is a popular logger.
 */
app.use(morgan('dev'));

app.use(express.json());
app.use(express.static('public'));

/*
 * All routes for the API are written in modules in the api/ directory.  The
 * top-level router lives in api/index.js.  That's what we include here, and
 * it provides all of the routes.
 */
app.use(rateLimit);

app.use('/', api);

app.use('*', function (req, res, next) {
  res.status(404).json({
    error: "Requested resource " + req.originalUrl + " does not exist"
  });
});

connectToDB(() => {
  app.listen(port, () => {
    console.log("== Server is running on port", port);
  });
});
