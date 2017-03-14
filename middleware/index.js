var User = require('./../models/user');
var Blog = require('./../models/blog');
var Comment = require('./../models/comment');

var middlewareObj = {};

//checks if user is logged in
middlewareObj.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
};
//checks blog ownership
middlewareObj.checkBlogOwnership = function (req, res, next) {
    //check if user is logged in
    if (req.isAuthenticated()) {
        //find blog in db by id
        Blog.findById(req.params.id, function (err, foundBlog) {
            if (err) {
                res.redirect('back')
            }
            //check blog.author.id that is going to be edited or deleted to be similar with req.user.id
            if (foundBlog.author.id.equals(req.user.id)) {
                next();
            } else {
                res.redirect('back');
            }
        })
    } else {
        res.redirect('back')
    }
};
//checks comment ownership
middlewareObj.checkCommentOwnership = function (req, res, next) {
    //check if user is logged in
    if (req.isAuthenticated()) {
        //find comment in db by id
        Comment.findById(req.params.comment_id, function (err, foundComment) {
            if (err) {
                res.redirect('back')
            }
            //check comment.author.id that is going to be edited or deleted to be similar with req.user.id
            if (foundComment.author.id.equals(req.user.id)) {
                next();
            } else {
                res.redirect('back');
            }
        })
    } else {
        res.redirect('back')
    }
};

//checks user ownership
middlewareObj.checkUserOwnership = function (req, res, next) {
    //check if user is logged in
    if (req.isAuthenticated()) {
        //find user in db by id
        User.findById(req.params.id, function (err, foundUser) {
            if (err) {
                res.redirect('back')
            }
            //check user id that is going to be edited or deleted to be similar with req.user.id
            if (foundUser._id.equals(req.user.id)) {
                next();
            } else {
                res.redirect('back');
            }
        })
    } else {
        res.redirect('back')
    }
};

module.exports = middlewareObj;