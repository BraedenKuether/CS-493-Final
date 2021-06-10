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
  playlistCover: {required: true}
};
exports.PlaylistSchema = PlaylistSchema;

async function getPlaylists(page) {
  const db = getDBReference();
  const collection = db.collection('playlists');
  const count = await collection.countDocuments();

  /*
   * Compute last page number and make sure page is within allowed bounds.
   * Compute offset into collection.
   */
  const pageSize = 10;
  const lastPage = Math.ceil(count / pageSize);
  page = page > lastPage ? lastPage : page;
  page = page < 1 ? 1 : page;
  const offset = (page - 1) * pageSize;

  const results = await collection.find({})
    .sort({ _id: 1 })
    .skip(offset)
    .limit(pageSize)
    .toArray();

  return {
    playlists: results,
    page: page,
    totalPages: lastPage,
    pageSize: pageSize,
    count: count
  };
}
exports.getPlaylists = getPlaylists;
/*
 * Executes a DB query to insert a new business into the database.  Returns
 * a Promise that resolves to the ID of the newly-created business entry.
 */
async function insertNewPlaylist(playlist) {
  playlist = extractValidFields(playlist, PlaylistSchema);
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

async function updatePlaylist(id, playlist) {
  const db = getDBReference();
  const collection = db.collection('playlists');
  if (!ObjectId.isValid(id)) {
    return false;
  } else {
    var myquery = {_id: new ObjectId(id)};
    var newvalues = { $set: { userid: playlist.userid, name: playlist.name, songs: playlist.songs}};
    const results = await collection
      .updateOne(myquery, newvalues, function(err, obj) {
        if (err) throw err;
        console.log("1 document updated");
      })
    
    return true;
  }

}
exports.updatePlaylist = updatePlaylist;

async function deletePlaylist(id) {
  const db = getDBReference();
  const collection = db.collection('playlists');
  if (!ObjectId.isValid(id)) {
    return false;
  } else {
    var myquery = {_id: new ObjectId(id)};
    const results = await collection
      .deleteOne(myquery, function(err, obj) {
        if (err) throw err;
        console.log("1 document deleted");
      });
    return true;
  }
  
}
exports.deletePlaylist = deletePlaylist;