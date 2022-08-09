const express = require("express");
const router = express.Router();
const postController = require("../controller/postsController");

router.post('/add', function(req, res, next) {
    postController.addPost(req, res, next)
})

router.get('/list', function(req, res, next) {
    postController.getPostList(req, res, next)
})

router.post('/update', function(req, res, next) {
    postController.updatePost(req, res, next)
})

router.post('/delete', function(req, res, next) {
    postController.deletePost(req, res, next)
})

module.exports = router;