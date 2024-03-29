const mongoose = require('mongoose')
const Schema = mongoose.Schema;


const PostSchema = new Schema(
    {
      text: { type: String, required: true, minLength: 1, maxLength: 280 },
      creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      saves: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    },
    {
      timestamps: true,
    }
  );
  const Post = mongoose.model('Post', PostSchema);
  module.exports = Post;
  

