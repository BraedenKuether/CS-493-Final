/*
 * API sub-router for playlist collection endpoints.
 */
const router = require('express').Router();

const { validateAgainstSchema } = require('../lib/validation');
const {
  PlaylistSchema,
  insertNewPlaylist,
  getPlaylistById
} = require('../models/songs');

/*
 * Route to fetch info about a specific song.
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
      error: "Unable to fetch song.  Please try again later."
    });
  }
});

module.exports = router;
