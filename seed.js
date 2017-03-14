var mongoose = require('mongoose');
var User = require('./models/user');
var Blog = require('./models/blog');
var Comment = require('./models/comment');
var passport = require('passport');
var async = require('async');

//seed data
var comments = [
    {
        text: 'Text of first comment'
    },
    {
        text: 'Text of second comment'
    },
    {
        text: 'Text of third comment'
    }


];
//seed data
var blogs1 = [
    {
        title: 'User 1 Blog',
        image: 'https://images.unsplash.com/photo-1470020337050-543c4e581988?dpr=1&auto=compress,format&fit=crop&w=991&h=661&q=80&cs=tinysrgb&crop=',
        body: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aperiam aut consequuntur cum enim harum id, in iusto maxime minus molestiae mollitia nobis officiis perferendis porro praesentium quas quisquam similique voluptas? Aliquid architecto at aut consequatur, consequuntur dolorem eaque explicabo fuga harum hic ipsa iste iusto laboriosam laudantium minus molestias nam necessitatibus, officia optio placeat porro quibusdam quisquam saepe unde vitae! Aperiam at corporis, dignissimos ducimus enim fugiat inventore ipsa ipsam itaque laboriosam maiores molestiae molestias quae totam vero. Amet distinctio rem veritatis! Accusamus et minus quibusdam? Cumque nobis porro unde. Culpa iusto molestias sapiente sed? Ad amet assumenda aut consectetur deserunt dolore ea, expedita iste itaque nesciunt officia optio placeat porro quibusdam quis quisquam sequi ut. Aliquam dolore iusto nam."
    },
    {
        title: 'User 1 Blog',
        image: 'https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?dpr=1&auto=compress,format&fit=crop&w=991&h=1322&q=80&cs=tinysrgb&crop=',
        body: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aperiam aut consequuntur cum enim harum id, in iusto maxime minus molestiae mollitia nobis officiis perferendis porro praesentium quas quisquam similique voluptas? Aliquid architecto at aut consequatur, consequuntur dolorem eaque explicabo fuga harum hic ipsa iste iusto laboriosam laudantium minus molestias nam necessitatibus, officia optio placeat porro quibusdam quisquam saepe unde vitae! Aperiam at corporis, dignissimos ducimus enim fugiat inventore ipsa ipsam itaque laboriosam maiores molestiae molestias quae totam vero. Amet distinctio rem veritatis! Accusamus et minus quibusdam? Cumque nobis porro unde. Culpa iusto molestias sapiente sed? Ad amet assumenda aut consectetur deserunt dolore ea, expedita iste itaque nesciunt officia optio placeat porro quibusdam quis quisquam sequi ut. Aliquam dolore iusto nam."
    },
    {
        title: 'User 1 Blog',
        image: 'https://images.unsplash.com/photo-1485594050903-8e8ee7b071a8?dpr=1&auto=compress,format&fit=crop&w=991&h=709&q=80&cs=tinysrgb&crop=',
        body: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aperiam aut consequuntur cum enim harum id, in iusto maxime minus molestiae mollitia nobis officiis perferendis porro praesentium quas quisquam similique voluptas? Aliquid architecto at aut consequatur, consequuntur dolorem eaque explicabo fuga harum hic ipsa iste iusto laboriosam laudantium minus molestias nam necessitatibus, officia optio placeat porro quibusdam quisquam saepe unde vitae! Aperiam at corporis, dignissimos ducimus enim fugiat inventore ipsa ipsam itaque laboriosam maiores molestiae molestias quae totam vero. Amet distinctio rem veritatis! Accusamus et minus quibusdam? Cumque nobis porro unde. Culpa iusto molestias sapiente sed? Ad amet assumenda aut consectetur deserunt dolore ea, expedita iste itaque nesciunt officia optio placeat porro quibusdam quis quisquam sequi ut. Aliquam dolore iusto nam."
    }
];
//seed data
var blogs2 = [
    {
        title: 'User 2 Blog',
        image: 'https://images.unsplash.com/photo-1423034816855-245e5820ff8c?dpr=1&auto=compress,format&fit=crop&w=991&h=1321&q=80&cs=tinysrgb&crop=',
        body: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aperiam aut consequuntur cum enim harum id, in iusto maxime minus molestiae mollitia nobis officiis perferendis porro praesentium quas quisquam similique voluptas? Aliquid architecto at aut consequatur, consequuntur dolorem eaque explicabo fuga harum hic ipsa iste iusto laboriosam laudantium minus molestias nam necessitatibus, officia optio placeat porro quibusdam quisquam saepe unde vitae! Aperiam at corporis, dignissimos ducimus enim fugiat inventore ipsa ipsam itaque laboriosam maiores molestiae molestias quae totam vero. Amet distinctio rem veritatis! Accusamus et minus quibusdam? Cumque nobis porro unde. Culpa iusto molestias sapiente sed? Ad amet assumenda aut consectetur deserunt dolore ea, expedita iste itaque nesciunt officia optio placeat porro quibusdam quis quisquam sequi ut. Aliquam dolore iusto nam."
    },
    {
        title: 'User 2 Blog',
        image: 'https://images.unsplash.com/photo-1464454709131-ffd692591ee5?dpr=1&auto=compress,format&fit=crop&w=991&h=656&q=80&cs=tinysrgb&crop=',
        body: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aperiam aut consequuntur cum enim harum id, in iusto maxime minus molestiae mollitia nobis officiis perferendis porro praesentium quas quisquam similique voluptas? Aliquid architecto at aut consequatur, consequuntur dolorem eaque explicabo fuga harum hic ipsa iste iusto laboriosam laudantium minus molestias nam necessitatibus, officia optio placeat porro quibusdam quisquam saepe unde vitae! Aperiam at corporis, dignissimos ducimus enim fugiat inventore ipsa ipsam itaque laboriosam maiores molestiae molestias quae totam vero. Amet distinctio rem veritatis! Accusamus et minus quibusdam? Cumque nobis porro unde. Culpa iusto molestias sapiente sed? Ad amet assumenda aut consectetur deserunt dolore ea, expedita iste itaque nesciunt officia optio placeat porro quibusdam quis quisquam sequi ut. Aliquam dolore iusto nam."
    },
    {
        title: 'User 2 Blog',
        image: 'https://images.unsplash.com/photo-1468016656252-5723d582487c?dpr=1&auto=compress,format&fit=crop&w=991&h=743&q=80&cs=tinysrgb&crop=',
        body: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aperiam aut consequuntur cum enim harum id, in iusto maxime minus molestiae mollitia nobis officiis perferendis porro praesentium quas quisquam similique voluptas? Aliquid architecto at aut consequatur, consequuntur dolorem eaque explicabo fuga harum hic ipsa iste iusto laboriosam laudantium minus molestias nam necessitatibus, officia optio placeat porro quibusdam quisquam saepe unde vitae! Aperiam at corporis, dignissimos ducimus enim fugiat inventore ipsa ipsam itaque laboriosam maiores molestiae molestias quae totam vero. Amet distinctio rem veritatis! Accusamus et minus quibusdam? Cumque nobis porro unde. Culpa iusto molestias sapiente sed? Ad amet assumenda aut consectetur deserunt dolore ea, expedita iste itaque nesciunt officia optio placeat porro quibusdam quis quisquam sequi ut. Aliquam dolore iusto nam."
    }
];

//seed data
var users = [
    {
        fname: 'Omar',
        lname: 'Santiago',
        username: 'omar',
        image: 'https://my-hit.org/storage/1657624_500x800x250.jpg'
    },

    {
        fname: 'Bob',
        lname: 'Marley',
        username: 'bob',
        image: 'https://s-media-cache-ak0.pinimg.com/originals/d7/3c/7f/d73c7fa7eb84787c352a3076f9753138.jpg'
    }
];


function seedDB() {
    async.series([
        //wipe users collection
        function (callback) {
            User.remove({}, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Removed Users!");
                    callback();
                }
            })
        },
        //wipe blogs collection
        function (callback) {
            Blog.remove({}, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Removed Blogs!");
                    callback();
                }
            })
        },
        //wipe comments collection
        function (callback) {
            Comment.remove({}, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Removed Comments!");
                    callback();
                }
            })
        },
        //create user 1
        function (callback) {
            User.register(users[0], 'password', function (err, newUser) {
                if (err) {
                    console.log(err);
                } else {
                    //async each to create blogs for user
                    async.each(blogs1, function (blog, callback) {
                        Blog.create(blog, function (err, newBlog) {
                            if (err) {
                                console.log(err);
                            } else {
                                //async each to create comments for blog
                                async.each(comments, function (comment, callback) {
                                    Comment.create(comment, function (err, newComment) {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            //save data for comment
                                            newComment.author.id = newUser._id;
                                            newComment.author.fname = newUser.fname;
                                            newComment.author.lname = newUser.lname;
                                            newComment.author.image = newUser.image;
                                            newComment.save();

                                            //pushing comments into blog comments array
                                            newBlog.comments.push(newComment._id);
                                            //callback to end each for comments
                                            callback();
                                        }
                                    });
                                    //function which invokes after Each loop for comments completes
                                }, function (err) {
                                    if (err) {
                                        console.log("Can't create comment");
                                    } else {
                                        //save data for blog after all comments for this blog were created
                                        newBlog.author.id = newUser._id;
                                        newBlog.author.fname = newUser.fname;
                                        newBlog.author.lname = newUser.lname;
                                        newBlog.author.image = newUser.image;
                                        newBlog.save();
                                        console.log('Comments created!');
                                    }
                                });

                                //pushing new blogs into user array
                                newUser.blogs.push(newBlog);
                                callback();
                            }
                        });
                        //function which invokes after Each loop for blogs completes
                    }, function (err) {
                        if (err) {
                            console.log("Can't add blogs");
                        } else {
                            //save data for user after all blogs were created
                            newUser.save();
                            console.log('Blogs Added!')
                        }
                    });
                    callback();
                }
            })
        },

        //create user 2
        function (callback) {
            User.register(users[1], 'password', function (err, newUser) {
                if (err) {
                    console.log(err);
                } else {
                    //async each to create blogs for user
                    async.each(blogs2, function (blog, callback) {
                        Blog.create(blog, function (err, newBlog) {
                            if (err) {
                                console.log(err);
                            } else {
                                //async each to create comments for blog
                                async.each(comments, function (comment, callback) {
                                    Comment.create(comment, function (err, newComment) {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            //save data for comment
                                            newComment.author.id = newUser._id;
                                            newComment.author.fname = newUser.fname;
                                            newComment.author.lname = newUser.lname;
                                            newComment.author.image = newUser.image;
                                            newComment.save();

                                            //pushing comments into blog comments array
                                            newBlog.comments.push(newComment._id);
                                            //callback to end each for comments
                                            callback();
                                        }
                                    });
                                    //function which invokes after Each loop for comments completes
                                }, function (err) {
                                    if (err) {
                                        console.log("Can't create comment");
                                    } else {
                                        //save data for blog after all comments for this blog were created
                                        newBlog.author.id = newUser._id;
                                        newBlog.author.fname = newUser.fname;
                                        newBlog.author.lname = newUser.lname;
                                        newBlog.author.image = newUser.image;
                                        newBlog.save();
                                        console.log('Comments created!');
                                    }
                                });

                                //pushing new blogs into user array
                                newUser.blogs.push(newBlog);
                                callback();
                            }
                        });
                        //function which invokes after Each loop for blogs completes
                    }, function (err) {
                        if (err) {
                            console.log("Can't add blogs");
                        } else {
                            //save data for user after all blogs were created
                            newUser.save();
                            console.log('Blogs Added!')
                        }
                    });
                    callback();
                }
            })
        }
    ]);
}

module.exports = seedDB;
