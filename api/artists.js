/*
 * API sub-router for artists collection endpoints.
 */
const router = require('express').Router();

const { validateAgainstSchema } = require('../lib/validation');
const {
  ArtistSchema,
  insertNewArtist,
  getArtistById
} = require('../models/artists');

/*
 * Route to fetch info about a specific song.
 */
router.get('/:id', async (req, res, next) => {
  try {
    const artist = await getArtistById(req.params.id);
    if (artist) {
      res.status(200).send(artist);
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Unable to fetch artist. Please try again later."
    });
  }
});

module.exports = router;
