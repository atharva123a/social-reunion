import mongoose from 'mongoose';

const Schema = mongoose.Schema;
import validator from 'validator';

const postSchema = new Schema(
  {
    title: {
      type: String
    },
    desc: {
      type: String
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: 'user'
    },
    likes: {
      type: [mongoose.Types.ObjectId],
      ref: 'user'
    },
    comments: {
      type: [
        {
          comment: {
            type: String
          },
          userId: {
            type: mongoose.Types.ObjectId,
            ref: 'user'
          }
        }
      ]
    }
  },
  { timestamps: true }
);

const PostSchema = mongoose.model('post', postSchema);

export = PostSchema;
