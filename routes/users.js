var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('./../models/user');
var Blog = require('./../models/blog');
var Comment = require('./../models/comment');
var async = require('async');
var middleware = require('./../middleware/index');
var cloudinary = require('cloudinary');
var fs = require('fs');

//load register page
router.get('/register', function (req, res) {
    res.render('user/register');
});

//create new user in db and automatically authenticates and redirects him to user homepage
router.post('/register', function (req, res) {
    //upload image to cloud
    cloudinary.uploader.upload(req.file.path, function (results) {
        //delete file from tmp folder
        fs.unlink(req.file.path);
        //add to blog obj image cloud link
        req.body.user.image = results;
        User.register(new User({username: req.body.username}), req.body.password, function (err, registeredUser) {
            if (err) {
                console.log(err);
                res.render('user/register');
            } else {
                //authentication of newly created user
                passport.authenticate('local')(req, res, function () {
                    registeredUser.fname = req.body.user.fname;
                    registeredUser.lname = req.body.user.lname;
                    registeredUser.image = req.body.user.image;
                    registeredUser.save(function (err, updatedUser) {
                        if (err) {
                            return console.log(err);
                        }
                        res.redirect('/id' + (updatedUser._id).valueOf());
                    })
                });
            }
        })
    }, {type: "private", folder: 'users/'});
});

//load login page
router.get('/login', function (req, res) {
    res.render('user/login');
});

//authenticate user after entering credentials
router.post('/login', passport.authenticate('local', {failureRedirect: '/login'}),
    function (req, res) {
        res.redirect('/id' + req.user._id.valueOf());
    });
//logout route
router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/login');
});
//load user homepage
router.get('/id:id', middleware.isLoggedIn, function (req, res) {
    User.findById(req.params.id).populate('blogs').exec(function (err, foundUser) {
        if (err) {
            console.log(err);
        } else {
            res.render('user/index', {user: foundUser});
        }
    });
});
//load page to edit user info
router.get('/id:id/edit', middleware.checkUserOwnership, function (req, res) {
    User.findById(req.params.id, function (err, user) {
        if (err) {
            console.log(err);
        } else {
            res.render('user/edit', {user: user});
        }
    });
});

//save updates in db
router.put('/id:id/edit', middleware.checkUserOwnership, function (req, res) {
    User.findByIdAndUpdate(req.params.id, req.body.user, function (err, user) {
        if (err) {
            console.log(err);
        } else {
            if (req.file) {
                cloudinary.uploader.destroy(user.image.public_id, function (result) {
                    cloudinary.uploader.upload(req.file.path, function (results) {
                        //delete file from tmp folder
                        fs.unlink(req.file.path);
                        //add to blog obj image cloud link
                        user.image = results;
                        user.save(function () {
                            res.redirect('/id' + req.params.id);
                        });

                    }, {type: "private", folder: "users/"});

                }, {type: "private"});
            } else {
                res.redirect('/id' + req.params.id);
            }
        }
    })
});

//Removes all data related to this user, except comments on other blogs
router.delete('/id:id', middleware.checkUserOwnership, function (req, res) {
    User.findByIdAndRemove(req.params.id, function (err, user) {
        if (err) {
            return console.log(err);
        }
        cloudinary.uploader.destroy(user.image.public_id, function (result) {
            async.series([
                function (callback) {
                    //async remove for blogs array
                    async.each(user.blogs, function (blog, callback) {
                        Blog.findByIdAndRemove(blog, function (err, blog) {
                            if (err) {
                                console.log(err);
                                callback('Cant find a blog')
                            } else {
                                cloudinary.uploader.destroy(blog.image.public_id, function (result) {
                                    //async remove for comments array
                                async.each(blog.comments, function (comment, callback) {
                                    Comment.findByIdAndRemove(comment, function (err) {
                                        if (err) {
                                            console.log(err);
                                            callback('Cant find a comment')
                                        } else {
                                            callback();
                                        }
                                    })
                                }, function (err) {
                                    if (err) {
                                        console.log('A file failed to process!');
                                    } else {
                                        console.log('All comments have been removed successfully!')
                                    }
                                });
                                    console.log('Blog image removed from cloud!');
                                    callback();
                                }, {type: "private"});
                            }
                        })
                    }, function (err) {
                        if (err) {
                            console.log('A file failed to process!');
                        } else {
                            console.log('All blogs have been removed successfully!');
                            callback();
                        }
                    });
                },
                //redirect after removing all data
                function (callback) {
                    console.log('User image removed from cloud!');
                    console.log('User removed!');
                    res.redirect('/');
                    callback();
                }
            ]);
        }, {type: "private"});
    })
});

module.exports = router;