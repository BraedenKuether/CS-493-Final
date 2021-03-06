/*
 * Song schema and data accessor methods;
 */

const { ObjectId } = require('mongodb');

const { getDBReference } = require('../lib/mongo');
const { extractValidFields } = require('../lib/validation');
//const { getPhotosByBusinessId } = require('./photo');

/*
 * Schema describing required/optional fields of a business object.
 */
const SongSchema = {
  userid: { required: true },
  name: { required: true },
  //songID: { required: false },
  category: { required: true },
  subcategory: { required: true },
  artistid: { required: true },
};
exports.SongSchema = SongSchema;

/*
 * Executes a DB query to return a single page of businesses.  Returns a
 * Promise that resolves to an array containing the fetched page of businesses.
 */
async function getSongsPage(page) {
  const db = getDBReference();
  const collection = db.collection('songs');
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
    songs: results,
    page: page,
    totalPages: lastPage,
    pageSize: pageSize,
    count: count
  };
}
exports.getSongsPage = getSongsPage;

/*
 * Executes a DB query to insert a new business into the database.  Returns
 * a Promise that resolves to the ID of the newly-created business entry.
 */
async function insertNewSong(song) {
  song = extractValidFields(song, SongSchema);
  const db = getDBReference();
  const collection = db.collection('songs');
  const result = await collection.insertOne(song);
  return result.insertedId;
}
exports.insertNewSong = insertNewSong;

/*
 * Executes a DB query to fetch information about a single specified
 * business based on its ID.  Does not fetch photo data for the
 * business.  Returns a Promise that resolves to an object containing
 * information about the requested business.  If no business with the
 * specified ID exists, the returned Promise will resolve to null.
 */
async function getSongById(id) {
  const db = getDBReference();
  const collection = db.collection('songs');
  if (!ObjectId.isValid(id)) {
    return null;
  } else {
    const results = await collection
      .find({ _id: new ObjectId(id) })
      .toArray();
    return results[0];
  }
}

/*
 * Executes a DB query to fetch detailed information about a single
 * specified business based on its ID, including photo data for
 * the business.  Returns a Promise that resolves to an object containing
 * information about the requested business.  If no business with the
 * specified ID exists, the returned Promise will resolve to null.
 */
async function getSongDetailsById(id) {
  /*
   * Execute three sequential queries to get all of the info about the
   * specified business, including its photos.
   */
  const song = await getSongById(id);
  if (song) {
    //business.photos = await getPhotosByBusinessId(id);
  }
  return song;
}
exports.getSongDetailsById = getSongDetailsById;

async function songSearch(keyword) {
  const db = getDBReference();
  const collection = db.collection('songs');

  const results = await collection.find({
    "name": new RegExp(keyword, 'i')
  }).toArray();

  return results;

}
exports.songSearch = songSearch;