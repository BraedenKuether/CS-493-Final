const router = require('express').Router();

router.use('/songs', require('./songs'));
router.use('/artists', require('./artists'));
router.use('/playlists', require('./playlists'));
router.use('/users', require('./users'));
router.use('/media', require('./media'));


module.exports = router;
