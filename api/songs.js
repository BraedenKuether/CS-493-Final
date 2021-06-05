/*
 * API sub-router for songs collection endpoints.
 */
const router = require('express').Router();

const { validateAgainstSchema } = require('../lib/validation');
const {
  SongSchema,
  getSongsPage,
  insertNewSong,
  getSongDetailsById
} = require('../models/songs');

/*
 * Route to return a paginated list of songs.
 */
router.get('/', async (req, res) => {
  try {
    /*
     * Fetch page info, generate HATEOAS links for surrounding pages and then
     * send response.
     */
    const songPage = await getSongsPage(parseInt(req.query.page) || 1);
    songPage.links = {};
    if (songPage.page < songPage.totalPages) {
      songPage.links.nextPage = `/songs?page=${songPage.page + 1}`;
      songPage.links.lastPage = `/songs?page=${songPage.totalPages}`;
    }
    if (songPage.page > 1) {
      songPage.links.prevPage = `/songs?page=${songPage.page - 1}`;
      songPage.links.firstPage = '/songs?page=1';
    }
    res.status(200).send(songPage);
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Error fetching songs list.  Please try again later."
    });
  }
});

/*
 * Route to fetch info about a specific song.
 */
router.get('/:id', async (req, res, next) => {
  try {
    const song = await getSongDetailsById(req.params.id);
    if (song) {
      res.status(200).send(song);
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Unable to fetch song.  Please try again later."
    });
  }
});

module.exports = router;
