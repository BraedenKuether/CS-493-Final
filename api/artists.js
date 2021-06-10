/*
 * API sub-router for artists collection endpoints.
 */
const router = require('express').Router();

const { validateAgainstSchema } = require('../lib/validation');
const {
  ArtistSchema,
  insertNewArtist,
  getArtistById,
  getArtists,
} = require('../models/artists');

router.get('/', async (req, res, next) =>  {
  try {
    const artistPage = await getArtists(parseInt(req.query.page) || 1);
      artistPage.links = {};
      if (artistPage.page < artistPage.totalPages) {
        artistPage.links.nextPage = `/artists?page=${artistPage.page + 1}`;
        artistPage.links.lastPage = `/artists?page=${artistPage.totalPages}`;
      }
      if (artistPage.page > 1) {
        artistPage.links.prevPage = `/artists?page=${artistPage.page - 1}`;
        artistPage.links.firstPage = '/artists?page=1';
      }
      res.status(200).send(artistPage);
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Error fetching playlists. Please try again later."
      });
    }
});

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

router.post('/', async (req, res, next) => {
  res.status(200).send({
    success: "It worked!"
  });
  console.log("Hello");
  try {
    const artist = await insertNewArtist(req.body);
    console.log(artist);
    if (artist) {
      res.status(200).send(artist);
    } else {
      console.log("ERROR");
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Unable to add artist. Please try again later."
    });
  }
});

module.exports = router;
