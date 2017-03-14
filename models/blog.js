var mongoose = require('mongoose');

var blogSchema = new mongoose.Schema(
    {
        title: String,
        image: String,
        body: String,
        //reference to user that created this blog
        author: {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            fname: String,
            lname: String,
            image: String
        },
        //reference to comments that are related with this blog
        comments: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Comment'
            }
        ],
        created: {
            type: Date,
            default: Date.now
        }


}
);

module.exports = mongoose.model('Blog', blogSchema);