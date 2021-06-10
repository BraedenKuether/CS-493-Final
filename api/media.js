const express = require('express');
const router = express.Router();;

router.get('/:filename', express.static(`${__dirname}/uploads`));

router.use('*', (err, req, res, next) => {
    console.error(err);
    res.status(500).send({
        error: "An error occured. Try again later."
    })
});

module.exports = router;

