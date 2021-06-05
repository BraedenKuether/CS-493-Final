/*
 * Playlist schema and data accessor methods;
 */

const { ObjectId } = require('mongodb');

const { getDBReference } = require('../lib/mongo');
const { extractValidFields } = require('../lib/validation');

/*
 * Schema describing required/optional fields of a review object.
 */
const PlaylistSchema = {
  userid: { required: true },
  name: { required: true },
  songs: { required: true },
};
exports.PlaylistSchema = PlaylistSchema;

/*
 * Executes a DB query to insert a new business into the database.  Returns
 * a Promise that resolves to the ID of the newly-created business entry.
 */
async function insertNewPlaylist(playlist) {
  playlist = extractValidFields(playlist, SongSchema);
  const db = getDBReference();
  const collection = db.collection('playlists');
  const result = await collection.insertOne(playlist);
  return result.insertedId;
}
exports.insertNewPlaylist = insertNewPlaylist;

/*
 * Executes a DB query to fetch information about a single specified
 * business based on its ID.  Does not fetch photo data for the
 * business.  Returns a Promise that resolves to an object containing
 * information about the requested business.  If no business with the
 * specified ID exists, the returned Promise will resolve to null.
 */
async function getPlaylistById(id) {
  const db = getDBReference();
  const collection = db.collection('playlists');
  if (!ObjectId.isValid(id)) {
    return null;
  } else {
    const results = await collection
      .find({ _id: new ObjectId(id) })
      .toArray();
    return results[0];
  }
}
exports.getPlaylistById = getPlaylistById;
