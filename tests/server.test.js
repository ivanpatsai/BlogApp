var expect = require('expect');
var request = require('supertest');
var app = require('./../app');
var agent = request.agent(app);
var User = require('./../models/user');
var Blog = require('./../models/blog');
var Comment = require('./../models/comment');
var cloudinary = require('cloudinary');


var user = {
    fname: 'Test',
    lname: 'User',
    username: 'test',
    password: 'password'
};
var blog = {
    body: 'Blog body',
    title: 'Blog title'
};
var comments = {
    text: 'test test test'
};
var cloudImageUserID;
var cloudImageBlogID;
var cloudImageUserPath;
var cloudImageBlogPath;
var userId;
var blogId;
var commentId;

//create user
describe('User POST /register', function () {
    it('should create new user, session and redirect to user homepage', function (done) {
        request(app)
            .post('/register')
            .set('Content-Type', 'multipart/form-data')
            .attach('image', './tests/seeds/images/test1.png')
            .field('username', user.username)
            .field('password', user.password)
            .field('user[fname]', user.fname)
            .field('user[lname]', user.lname)
            .expect(302)
            .end(function (err, res) {
                expect(err).toNotExist();
                expect(res.header.location).toInclude('/id');
                expect(res.header['set-cookie']).toExist();
                User.findOne({username: user.username}, function (err, foundUser) {
                    if (err) {
                        return done(err);
                    }
                    expect(foundUser.image.url).toInclude('cloudinary');
                    expect(foundUser.blogs).toExist();
                    expect(res.header.location).toInclude(foundUser._id);
                    expect(foundUser.fname).toBe(user.fname);
                    expect(foundUser.lname).toBe(user.lname);
                    cloudImageUserPath = foundUser.image.url;
                    userId = foundUser._id;
                    done();
                });
            })
    });
});
//update user
describe('User PUT /id:id', function () {
    //create a  logged in user before put tests
    before(function (done) {
        agent
            .post('/login')
            .send({username: user.username, password: user.password})
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                return done()
            });
    });
    it('should not update user picture if image is not attached', function (done) {
        agent
            .put('/id' + userId)
            .set('Content-Type', 'multipart/form-data')
            .field('user[fname]', user.fname + 'update')
            .field('user[lname]', user.lname + 'update')
            .expect(302)
            .end(function (err, res) {
                expect(err).toNotExist();
                expect(res.header.location).toInclude('/id');
                User.findOne({username: user.username}, function (err, foundUser) {
                    if (err) {
                        return done(err);
                    }
                    expect(foundUser.image.url).toBe(cloudImageUserPath);
                    expect(res.header.location).toInclude(foundUser._id);
                    expect(foundUser.fname).toBe(user.fname + 'update');
                    expect(foundUser.lname).toBe(user.lname + 'update');
                    done();
                });
            })
    });
    it('should update user data and picture on cloud if user chose new one', function (done) {
        agent
            .put('/id' + userId)
            .set('Content-Type', 'multipart/form-data')
            .attach('image', './tests/seeds/images/test2.png')
            .field('user[fname]', user.fname)
            .field('user[lname]', user.lname)
            .expect(302)
            .end(function (err, res) {
                expect(err).toNotExist();
                expect(res.header.location).toInclude('/id');
                User.findOne({username: user.username}, function (err, foundUser) {
                    if (err) {
                        return done(err);
                    }
                    expect(foundUser.image.url).toNotBe(cloudImageUserPath);
                    expect(res.header.location).toInclude(foundUser._id);
                    expect(foundUser.fname).toBe(user.fname);
                    expect(foundUser.lname).toBe(user.lname);
                    cloudImageUserID = foundUser.image.public_id;
                    done();
                });
            })
    });

});

//create blog
describe('Blog POST /blogs', function () {
    it('should create new blog, redirect to show blog page', function (done) {
        agent
            .post('/blogs')
            .set('Content-Type', 'multipart/form-data')
            .attach('image', './tests/seeds/images/test1.png')
            .field('blog[title]', blog.title)
            .field('blog[body]', blog.body)
            .expect(302)
            .end(function (err, res) {
                expect(err).toNotExist();
                Blog.findOne({title: blog.title}, function (err, foundBlog) {
                    if (err) {
                        return done(err);
                    }
                    expect(foundBlog.image.url).toInclude('cloudinary');
                    expect(foundBlog.created).toExist();
                    expect(res.header.location).toInclude(foundBlog._id);
                    expect(foundBlog.title).toBe(blog.title);
                    expect(foundBlog.body).toBe(blog.body);
                    cloudImageBlogPath = foundBlog.image.url;
                    cloudImageBlogID = foundBlog.image.public_id;
                    blogId = foundBlog._id;
                    done();
                });
            })
    });
    it('should save logged in user as author', function (done) {
        Blog.findOne({title: blog.title}, function (err, foundBlog) {
            if (err) {
                return done(err);
            }
            expect(foundBlog.author.fname).toBe(user.fname);
            expect(foundBlog.author.lname).toBe(user.lname);
            done();
        });
    });
    it('should add blog._id to user.blogs array', function (done) {
        User.findOne({username: user.username}, function (err, foundUser) {
            if (err) {
                return done(err);
            }
            expect(foundUser.blogs).toInclude(blogId);
            done();
        })
    });
    it('should save blog image to cloud', function (done) {
        cloudinary.v2.uploader.explicit(cloudImageBlogID,
            {type: "private"},
            function (error, result) {
                expect(result).toExist();
                done();
            });
    })
});

//update blog
describe('Blog PUT /blogs/:id', function () {
    it('should not update blog picture if image is not attached', function (done) {
        agent
            .put('/blogs/' + blogId)
            .set('Content-Type', 'multipart/form-data')
            .field('blog[title]', blog.title + 'update')
            .field('blog[body]', blog.body + 'update')
            .expect(302)
            .end(function (err, res) {
                expect(err).toNotExist();
                Blog.findOne({title: blog.title + 'update'}, function (err, foundBlog) {
                    if (err) {
                        return done(err);
                    }
                    expect(foundBlog.image.url).toBe(cloudImageBlogPath);
                    expect(foundBlog.created).toExist();
                    expect(res.header.location).toInclude(foundBlog._id);
                    expect(foundBlog.title).toBe(blog.title + 'update');
                    expect(foundBlog.body).toBe(blog.body + 'update');
                    done();
                });
            })
    });
    it('should update blog data and picture on cloud if user chose new one', function (done) {
        agent
            .put('/blogs/' + blogId)
            .set('Content-Type', 'multipart/form-data')
            .attach('image', './tests/seeds/images/test2.png')
            .field('blog[title]', blog.title)
            .field('blog[body]', blog.body)
            .expect(302)
            .end(function (err, res) {
                expect(err).toNotExist();
                Blog.findOne({title: blog.title}, function (err, foundBlog) {
                    if (err) {
                        return done(err);
                    }
                    expect(foundBlog.image.url).toNotBe(cloudImageBlogPath);
                    expect(res.header.location).toInclude(foundBlog._id);
                    expect(foundBlog.title).toBe(blog.title);
                    expect(foundBlog.body).toBe(blog.body);
                    cloudImageBlogID = foundBlog.image.public_id;
                    done();
                });
            })
    });

});

//create comment
describe('Comment POST /blogs/:id/comments', function () {
    it('should create new comment', function (done) {
        agent
            .post('/blogs/' + blogId + '/comments')
            .field('comment[text]', comments.text)
            .expect(302)
            .end(function (err, res) {
                expect(err).toNotExist();
                Comment.findOne({text: comments.text}, function (err, comment) {
                    if (err) {
                        return done(err);
                    }
                    expect(comment.created).toExist();
                    expect(res.header.location).toInclude(blogId);
                    expect(comment.text).toBe(comments.text);
                    commentId = comment._id;
                    done();
                });
            })
    });
    it('should save logged in user as author', function (done) {
        Comment.findOne({text: comments.text}, function (err, comment) {
            if (err) {
                return done(err);
            }
            expect(comment.author.fname).toBe(user.fname);
            expect(comment.author.lname).toBe(user.lname);
            expect(comment.author.image).toExist();
            done();
        });
    });
    it('should add comment._id to blog.comments array', function (done) {
        Blog.findOne({title: blog.title}, function (err, blog) {
            if (err) {
                return done(err);
            }
            expect(blog.comments).toInclude(commentId);
            done();
        })
    });

});

//update comment
describe('Comment PUT /blogs/:id/comments/comment_id', function () {
    it('should update comment and redirect to blog page', function (done) {
        agent
            .put('/blogs/' + blogId + '/comments/' + commentId)
            .field('comment[text]', comments.text + 'update')
            .expect(302)
            .end(function (err, res) {
                expect(err).toNotExist();
                Comment.findOne({text: comments.text + 'update'}, function (err, comment) {
                    if (err) {
                        return done(err);
                    }
                    expect(res.header.location).toInclude(blogId);
                    expect(comment.text).toBe(comments.text + 'update');
                    done();
                });
            })
    });

});

//login
describe('User POST /login', function () {
    it('should create a session and redirect to user homepage if credentials is valid', function (done) {
        request(app)
            .post('/login')
            .send({
                username: user.username,
                password: user.password
            })
            .expect(302)
            .end(function (err, res) {
                expect(err).toNotExist();
                expect(res.header.location).toInclude('/id');
                expect(res.header['set-cookie']).toExist();
                done()
            })
    });
    it('should not create a session and redirect to user homepage if credentials is invalid', function (done) {
        request(app)
            .post('/login')
            .send({
                username: user.username,
                password: 'fake password'
            })
            .expect(302)
            .end(function (err, res) {
                expect(err).toNotExist();
                expect(res.header.location).toInclude('/login');
                expect(res.header['set-cookie']).toNotExist();
                done()
            })
    });
});

//delete content
describe('Comment DELETE /blogs/:id/comments/comment_id', function () {
    after(function (done) {
        agent
            .post('/blogs/' + blogId + '/comments')
            .field('comment[text]', comments.text)
            .end(function (err, res) {
                Comment.findOne({text: comments.text}, function (err, comment) {
                    if (err) {
                        return done(err);
                    }
                    commentId = comment._id;
                    done();
                });
            })
    });
    it('should delete comment', function (done) {
        agent
            .delete('/blogs/' + blogId + '/comments/' + commentId)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                Comment.find({}, function (err, comment) {
                    if (err) {
                        done(err)
                    } else {
                        expect(comment.length).toBe(0);
                        done();
                    }
                });


            })
    });
    it('should delete comment._id from blog.comments array', function (done) {
        Blog.findById(blogId, function (err, blog) {
            if (err) {
                return done(err);
            }
            expect(blog.comments.length).toBe(0);
            done();
        })
    })
});

//delete blog
describe('Blog DELETE /blogs/id:id', function () {
    after(function (done) {
        agent
            .post('/blogs')
            .set('Content-Type', 'multipart/form-data')
            .attach('image', './tests/seeds/images/test1.png')
            .field('blog[title]', blog.title)
            .field('blog[body]', blog.body)
            .end(function (err, res) {
                Blog.findOne({title: blog.title}, function (err, blog) {
                    if (err) {
                        return done(err);
                    }
                    cloudImageBlogPath = blog.image.url;
                    cloudImageBlogID = blog.image.public_id;
                    blogId = blog._id;
                    agent
                        .post('/blogs/' + blogId + '/comments')
                        .field('comment[text]', comments.text)
                        .end(function (err, res) {
                            Comment.findOne({text: comments.text}, function (err, comment) {
                                if (err) {
                                    return done(err);
                                }
                                commentId = comment._id;
                                done();
                            });
                        })
                });
            })
    });
    it('should delete blog', function (done) {
        agent
            .delete('/blogs/' + blogId)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                Blog.find({}, function (err, blogs) {
                    if (err) {
                        done(err)
                    } else {
                        expect(blogs.length).toBe(0);
                        done();
                    }
                });


            })
    });
    it('should delete a cloud image', function (done) {
        cloudinary.v2.uploader.explicit(cloudImageBlogID,
            {type: "private"},
            function (error, result) {
                expect(result).toNotExist();
                done();
            });

    });
    it('should delete blog._id from user.blogs array', function (done) {
        User.findOne({username: user.username}, function (err, user) {
            if (err) {
                return done(err);
            }
            expect(user.blogs.length).toBe(0);
            done();
        })
    })
});

//delete user
describe('User DELETE /id:id', function () {
    it('should delete user', function (done) {
        agent
            .delete('/id' + userId)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                User.find({}, function (err, users) {
                    if (err) {
                        done(err)
                    } else {
                        expect(users.length).toBe(0);
                        done();
                    }
                });


            })
    });
    it('should delete a cloud image', function (done) {
        cloudinary.v2.uploader.explicit(cloudImageUserID,
            {type: "private"},
            function (error, result) {
                expect(result).toNotExist();
                done();
            });

    });
    it('should delete all user blogs', function (done) {
        Blog.find({}, function (err, blogs) {
            expect(err).toNotExist();
            expect(blogs.length).toBe(0);
            done();
        })
    });
    it('should delete comments', function (done) {
        Comment.find({}, function (err, comments) {
            expect(err).toNotExist();
            expect(comments.length).toBe(0);
            done();
        })
    })
});