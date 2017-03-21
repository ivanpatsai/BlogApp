var mongoose = require('mongoose');

var commentSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 256,
        trim: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    //reference to user that created this comment
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        fname: String,
        lname: String,
        image: mongoose.Schema.Types.Mixed
    }
});

module.exports = mongoose.model('Comment', commentSchema);