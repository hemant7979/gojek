var express = require('express');
var router = express.Router();
var userController = require("../controller/userController")

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/login', function( req, res, next ) {
  userController.userLogin(req, res, next)
})

router.get('/:id',(req, res, next) => {
  userController.userDetailById(req, res, next)
});

router.post('/update/:id',(req, res, next) => {
  userController.updateUser(req, res, next)
});

router.post('/delete/:id',(req, res, next) => {
  userController.deleteById(req, res, next)
});

module.exports = router;
