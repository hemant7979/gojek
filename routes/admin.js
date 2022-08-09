var express = require("express");
var router = express.Router();
var adminController = require("../controller/adminController");

router.get('/', function( req, res, next ) {
    res.send()
})

router.post('/login', function( req, res, next ) {
    adminController.adminLogin(req, res, next)
})

router.post('/user/registration', function( req, res, next ) {
    adminController.userSignUP(req, res, next)
})

router.get('/user/list', function( req, res, next ) {
    adminController.getAllUsers(req, res, next)
})

router.get('/user/:id',(req, res, next) => {
    adminController.userDetailById(req, res, next)
});

router.post('/user/update',(req, res, next) => {
    adminController.updateUser(req, res, next)
});

router.post('/user/delete/:id',(req, res, next) => {
    adminController.deleteUserById(req, res, next)
});

router.post('/update/user/permission/:id',(req, res, next) => {
    adminController.updateUserPermission(req, res, next)
});

module.exports = router;
