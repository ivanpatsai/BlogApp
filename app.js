require('./config/config');
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var expressSanitizer = require('express-sanitizer');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var User = require('./models/user');
var seedDB = require('./seed');
var cloudinary = require('cloudinary');
var multer = require('multer');
var fs = require('fs');
var morgan = require('morgan');
var flash = require('connect-flash');

//wipe db and fill up with new data
//seedDB();

//requiring routes
var commentRoutes = require('./routes/comments');
var blogRoutes = require('./routes/blogs');
var userRoutes = require('./routes/users');
var indexRoutes = require('./routes/index');
var app = express();

mongoose.connect(process.env.MONGODB_URI);

app.set('view engine', 'ejs');
//path to static folder
app.use(express.static(__dirname + '/public'));
// app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
//prevent scripts in entered data
app.use(expressSanitizer());
//allow to use PUT and DELETE requests
app.use(methodOverride('_method'));

//Passport config
app.use(require('express-session')({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));

//use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//make req.user available for templates
app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    next();
});
//allows user to upload files(images)
app.use(multer({dest: './routes/tmp'}).single('image'));

app.use('/', indexRoutes);
app.use('/', userRoutes);
app.use('/blogs/:id/comments', commentRoutes);
app.use('/blogs', blogRoutes);


app.listen(process.env.PORT, function () {
    console.log('Server is up on port ' + process.env.PORT + '!');
});

module.exports = app;