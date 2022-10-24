const express = require('express');
const Favorite = require('../models/favorite');
const authenticate = require('../authenticate');
const favoriteRouter = express.Router();
const cors = require('./cors');

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find( { user: req.user._id } )
    .populate('user')
    .populate('campsites')
    .then(favorites => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id })
    .then(favorite => {
        if (favorite === null){
            req.body.user = req.user._id
            Favorite.create(req.body)
            .then(favorite => {
                console.log('Favorite Created ', favorite);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
        })
        } else {
            Favorite.findOne( { user: req.user._id } )
            .then(favorite => {
                req.body.campsites.forEach(campsite => {
                    if (!favorite.campsites.includes(campsite._id)){
                        favorite.campsites.push(campsite._id)
                    }
                })
                favorite.save()
                .then(favorite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite)
                })
            })
        }
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser,  (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser,  (req, res, next) => {
    Favorite.findOneAndDelete({user: req.user._id })
    .then(favorite => {
        if (favorite){
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
        } else {
            res.statusCode = 404;
            res.end( 'You do not have any favorites to delete.')
        }
    })
    .catch(err => next(err));
});
favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /favorites/:campsiteId');
})
.post(cors.corsWithOptions, authenticate.verifyUser,  (req, res, next) => {
    Favorite.findOne({user: req.user._id })
    .then(favorite => {
        if (favorite === null){
            req.body.user = req.user._id
            req.body.campsites = [{"_id": req.params.campsiteId }]
            Favorite.create(req.body)
            .then(favorite => {
                console.log('Favorite Created ', favorite);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
        })
        } else if (favorite.campsites.includes(req.params.campsiteId)) {
            res.statusCode - 409;
            res.end('That campsite is already in the list of favorites!')
        } else {
            favorite.campsites.push({"_id": req.params.campsiteId })
            favorite.save()
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite)
        }
    })
})
.put(cors.corsWithOptions, authenticate.verifyUser,  (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites/:campsiteId');
})
.delete(cors.corsWithOptions, authenticate.verifyUser,  (req, res, next) => {
    Favorite.findOne({user: req.user._id })
    .then(favorite => {
        if (favorite.campsites.includes(req.params.campsiteId)){
            favorite.campsites.splice(favorite.campsites.indexOf({"_id": req.params.campsiteId}))
            favorite.save()
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
        } else {
            res.statusCode = 404;
            res.end("Could not find favorite to DELETE")
        }
    })
})
module.exports = favoriteRouter;