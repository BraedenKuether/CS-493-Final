/*
 * API sub-router for playlist collection endpoints.
 */
const router = require('express').Router();

const { validateAgainstSchema } = require('../lib/validation');
const { generateAuthToken, requireAuthentication } = require('../lib/auth');
const {
  PlaylistSchema,
  getPlaylists,
  insertNewPlaylist,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist
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
 * Route to fetch info about a specific playlist. --> AUTHENTICATION
 */
router.get('/:id', requireAuthentication, async (req, res, next) => {
    try {
      const playlist = await getPlaylistById(req.params.id);
      
      if (playlist){
        if (parseInt(playlist.userid) === parseInt(req.user)) {
          res.status(200).send(playlist);
        } else {
          res.status(403).send({
                error: "Unauthorized to access the specified resource"
          });
        }
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

// Route to post new playlists --> AUTHENTICATION
router.post('/', requireAuthentication, async (req, res, next) => {
  if (req.user === req.body.userid){
    try {
      const playlist = await insertNewPlaylist(req.body);
      if (playlist) {
        res.status(200).send(playlist);
      } else {
        next();
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Unable to add playlist. Please try again later."
      });
    } 
  } else {
    res.status(403).send({
      error: "Unauthorized to access the specified resource"
    });
  }
});

// Route to update a playlist --> AUTHENTICATION
router.put('/:id', requireAuthentication, async (req, res, next) => {
  console.log("it entered here");
  if (req.user === req.body.userid){
    try {
      const playlist = await updatePlaylist(req.params.id, req.body);
      if (playlist) {
        res.status(200).send(playlist);
      } else {
        console.log("Error here");
        next();
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Unable to update playlist. Please try again later."
      });
    } 
  } else {
    res.status(403).send({
      error: "Unauthorized to access the specified resource"
    });
  }
});

// Route to delete a playlist --> AUTHENTICATION
router.delete('/:id', requireAuthentication, async (req, res, next) => {
  let playlist;
  try{
    playlist = await getPlaylistById(req.params.id);
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Unable to fetch playlist.  Please try again later."
    });
  }
  
  if (req.user !== playlist.userid) {
    res.status(403).send({
      error: "Unauthorized to access the specified resource DELETE/playlist/:id"
    });
  } else {
    try {
      const deleteSuccessful = await deletePlaylist(req.params.id);
      if (deleteSuccessful) {
        res.status(204).end();
      } else {
        next();
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Unable to delete playlist.  Please try again later."
      });
    }
  }
});
module.exports = router;
