/*
 * Aritist schema and data accessor methods;
 */

const { ObjectId } = require('mongodb');

const { getDBReference } = require('../lib/mongo');
const { extractValidFields } = require('../lib/validation');

/*
 * Schema describing required/optional fields of a review object.
 */
const ArtistSchema = {
  userid: { required: true },
  name: { required: true },
  label: { required: false },
};
exports.ArtistSchema = ArtistSchema;

/*
 * Executes a DB query to insert a new business into the database.  Returns
 * a Promise that resolves to the ID of the newly-created business entry.
 */
async function insertNewArtist(artist) {
  artist = extractValidFields(artist, SongSchema);
  const db = getDBReference();
  const collection = db.collection('artists');
  const result = await collection.insertOne(artist);
  return result.insertedId;
}
exports.insertNewArtist = insertNewArtist;

/*
 * Executes a DB query to fetch information about a single specified
 * business based on its ID.  Does not fetch photo data for the
 * business.  Returns a Promise that resolves to an object containing
 * information about the requested business.  If no business with the
 * specified ID exists, the returned Promise will resolve to null.
 */
async function getArtistById(id) {
  const db = getDBReference();
  const collection = db.collection('artists');
  if (!ObjectId.isValid(id)) {
    return null;
  } else {
    const results = await collection
      .find({ _id: new ObjectId(id) })
      .toArray();
    return results[0];
  }
}
exports.getArtistById = getArtistById;
