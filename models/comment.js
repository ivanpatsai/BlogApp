var mongoose = require('mongoose');

var commentSchema = new mongoose.Schema({
    text: String,
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
        image: String
    }
});

module.exports = mongoose.model('Comment', commentSchema);