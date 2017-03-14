var express = require('express');
var router = express.Router({mergeParams: true});
var passport = require('passport');
var User = require('./../models/user');
var Blog = require('./../models/blog');
var Comment = require('./../models/comment');
var middleware = require('./../middleware/index');

//load page to create new comment
router.get('/new', middleware.isLoggedIn, function (req, res) {
    Blog.findById(req.params.id, function (err, foundBlog) {
        if(err){
            console.log(err);
        } else {
            res.render('comment/new', {blog: foundBlog});
        }

    })
});
//create new comment
router.post('/', middleware.isLoggedIn, function (req, res) {
    Blog.findById(req.params.id, function (err, foundBlog) {
        if (err) {
            console.log(err);
        } else {
            Comment.create(req.body.comment, function (err, newComment) {
                if (err) {
                    console.log(err);
                } else {
                    newComment.author.id = req.user._id;
                    newComment.author.fname = req.user.fname;
                    newComment.author.lname = req.user.lname;
                    newComment.author.image = req.user.image;
                    newComment.save();

                    foundBlog.comments.push(newComment);
                    foundBlog.save();

                    res.redirect('/blogs/' + foundBlog._id);
                }
            })
        }
    })
});

//load page to edit comment
router.get('/:comment_id/edit', middleware.checkCommentOwnership, function (req, res) {
    Comment.findById(req.params.comment_id, function (err, foundComment) {
        if(err) {
            console.log(err);
        } else {
            res.render('comment/edit', {comment: foundComment, blog_id: req.params.id});
        }
    })
});

//save updates to db
router.put('/:comment_id', middleware.checkCommentOwnership, function (req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function (err, updatedComment) {
        if(err){
            console.log(err);
        } else {
            res.redirect('/blogs/' + req.params.id);
        }
    })
});

//delete comment
router.delete('/:comment_id', middleware.checkCommentOwnership, function (req, res) {
    Comment.findByIdAndRemove(req.params.comment_id, function (err) {
        if(err){
            console.log(err);
        } else {
            res.redirect('/blogs/'+req.params.id);
        }
    });
    //delete comment id in blog.comments array
    Blog.findById(req.params.id, function(err, foundBlog){
        var index = foundBlog.comments.indexOf(req.params.comment_id);
        if (index > -1) {
            foundBlog.comments.splice(index, 1);
            foundBlog.save();
        } else {
            console.log('No such element');
        }
    })
});


module.exports = router;