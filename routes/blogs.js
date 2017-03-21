var express = require('express');
var router = express.Router();
var passport = require('passport');
var Blog = require('./../models/blog');
var User = require('./../models/user');
var Comment = require('./../models/comment');
var async = require('async');
var middleware = require('./../middleware/index');
var cloudinary = require('cloudinary');
var fs = require('fs');

//returns all available blogs in db
router.get('/', function (req, res) {
    Blog.find({}, function (err, foundBlogs) {
        if (err) {
            console.log(err);
        } else {
            res.render('blog/index', {blogs: foundBlogs});
        }
    });
});

//create new blog
router.post('/', middleware.isLoggedIn, function (req, res) {
    //upload image to cloud
    cloudinary.uploader.upload(req.file.path, function (results) {
        //delete file from tmp folder
        fs.unlink(req.file.path);
        //add to blog obj image cloud link
        req.body.blog.image = results;
        //scripts is not allowed in blog body
        req.body.blog.body = req.sanitize(req.body.blog.body);
        //looking for user in db
        User.findById(req.user.id, function (err, foundUser) {
            if (err) {
                console.log(err);
            } else {
                //save blog in db
                Blog.create(req.body.blog, function (err, newBlog) {
                    if (err) {
                        console.log(err)
                    } else {
                        //update blog author obj
                        newBlog.author.id = req.user._id;
                        newBlog.author.fname = req.user.fname;
                        newBlog.author.lname = req.user.lname;
                        newBlog.author.image = req.user.image;
                        newBlog.save();

                        //update users blogs array
                        foundUser.blogs.push(newBlog);
                        foundUser.save();
                        res.redirect('/blogs/' + newBlog._id);
                    }
                })
            }
        })
    }, {type: "private", folder: "blogs/"});
});
//return page to create new blog
router.get('/new', middleware.isLoggedIn, function (req, res) {
    res.render('blog/new');
});

//show blog by id
router.get('/:id', middleware.isLoggedIn, function (req, res) {
    //populate comments array in blog
    Blog.findById(req.params.id).populate('comments').exec(function (err, foundBlog) {
        if (err) {
            console.log(err);
        } else {
            res.render('blog/show', {blog: foundBlog});
        }
    })
});
//return page to edit blog
router.get('/:id/edit', middleware.checkBlogOwnership, function (req, res) {
    Blog.findById(req.params.id, function (err, foundBlog) {
        if (err) {
            console.log(err);
        } else {
            res.render('blog/edit', {blog: foundBlog});
        }
    })
});
//update blog changes in db
router.put('/:id', middleware.checkBlogOwnership, function (req, res) {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function (err, updatedBlog) {
        if (err) {
            console.log(err);
        } else {
            if (req.file) {
                cloudinary.uploader.destroy(updatedBlog.image.public_id, function (result) {
                    cloudinary.uploader.upload(req.file.path, function (results) {
                        //delete file from tmp folder
                        fs.unlink(req.file.path);
                        //add to blog obj image cloud link
                        updatedBlog.image = results;
                        updatedBlog.save(function () {
                            res.redirect('/blogs/' + updatedBlog._id);
                        });

                    }, {type: "private", folder: "blogs/"});

                }, {type: "private"});
            } else {
                res.redirect('/blogs/' + updatedBlog._id);
            }
        }
    })
});
//delete blog and all related comments
router.delete('/:id', middleware.checkBlogOwnership, function (req, res) {
    Blog.findByIdAndRemove(req.params.id, function (err, blog) {
        if (err) {
            console.log(err);
        } else {
            cloudinary.uploader.destroy(blog.image.public_id, function (result) {
                async.series([
                    function (callback) {
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
                                callback();
                            }
                        })
                    },
                    //Remove blogId from foundUser blogs arr
                    function (callback) {
                        User.findById(req.user.id, function (err, foundUser) {
                            var index = foundUser.blogs.indexOf(blog._id);
                            if (index > -1) {
                                foundUser.blogs.splice(index, 1);
                                foundUser.save();
                            } else {
                                console.log('No such element');
                            }
                            callback();
                        })
                    },
                    function (callback) {
                        res.redirect('/blogs');
                        callback();
                    }
                ]);
            }, {type: "private"});
        }
    })
});

module.exports = router;

