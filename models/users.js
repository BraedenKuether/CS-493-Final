/*
 * User schema and data accessor methods.
 */

const { ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');

const { extractValidFields } = require('../lib/validation');
const { getDBReference } = require('../lib/mongo');

/*
 * Schema for a User.
 */
const UserSchema = {
  name: { required: true },
  email: { required: true },
  password: { required: true }
};
exports.UserSchema = UserSchema;

/*
 * Insert a new User into the DB.
 */
exports.insertNewUser = async function (user) {
  const userToInsert = extractValidFields(user, UserSchema);
  console.log("  -- userToInsert before hashing:", userToInsert);
  userToInsert.password = await bcrypt.hash(userToInsert.password, 8);
  console.log("  -- userToInsert after hashing:", userToInsert);
  const db = getDBReference();
  const collection = db.collection('users');
  const result = await collection.insertOne(userToInsert);
  return result.insertedId;
};

/*
 * Fetch a user from the DB based on user ID.
 */
async function getUserById (id, includePassword) {
  const db = getDBReference();
  const collection = db.collection('users');
  if (!ObjectId.isValid(id)) {
    return null;
  } else {
    const projection = includePassword ? {} : { password: 0 }
    const results = await collection
      .find({ _id: new ObjectId(id) })
      .project(projection)
      .toArray();
    return results[0];
  }
};
exports.getUserById = getUserById;

exports.validateUser = async function (id, password) {
  const user = await getUserById(id, true);
  return user && await bcrypt.compare(password, user.password);
}

async function getAllUsers() {
  const db = getDBReference();
  const collection = db.collection('users');
  const results = await collection.find({})
  .sort({ _id: 1 })
  .toArray();

  return {
    users: results
  };

}
exports.getAllUsers = getAllUsers;

async function getPlaylistsByUserId(id) {
  const db = getDBReference();
  const collection = db.collection('playlists');
  const results = await collection.find({
    userid: id
  }).toArray();

  console.log(results); 

  return results
}
exports.getPlaylistsByUserId = getPlaylistsByUserId;