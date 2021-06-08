/*
 * API sub-router for playlist collection endpoints.
 */
const router = require('express').Router();

const { validateAgainstSchema } = require('../lib/validation');
const {
  PlaylistSchema,
  getPlaylists,
  insertNewPlaylist,
  getPlaylistById
} = require('../models/playlist');


//Method ot get all playlists
router.get('/', async (req, res, next) => {
  try {
  const playlistPage = await getPlaylists(parseInt(req.query.page) || 1);
    playlistPage.links = {};
    if (playlistPage.page < playlistPage.totalPages) {
      playlistPage.links.nextPage = `/playlists?page=${playlistPage.page + 1}`;
      playlistPage.links.lastPage = `/playlists?page=${playlistPage.totalPages}`;
    }
    if (playlistPage.page > 1) {
      playlistPage.links.prevPage = `/playlists?page=${playlistPage.page - 1}`;
      playlistPage.links.firstPage = '/playlists?page=1';
    }
    res.status(200).send(playlistPage);
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Error fetching playlists. Please try again later."
    });
  }
});
/*
 * Route to fetch info about a specific playlist.
 */
router.get('/:id', async (req, res, next) => {
  try {
    const playlist = await getPlaylistById(req.params.id);
    if (playlist) {
      res.status(200).send(playlist);
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Unable to fetch playlist. Please try again later."
    });
  }
});

module.exports = router;
