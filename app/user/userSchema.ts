import mongoose from 'mongoose';

const Schema = mongoose.Schema;
import validator from 'validator';

const userSchema = new Schema(
  {
    username: {
      type: String
    },
    email: {
      type: String,
      required: [true, 'Please provide email'],
      validate: {
        validator: validator.isEmail,
        message: 'Please provide a valid email!'
      },
      unique: [true]
    },
    password: {
      type: String,
      required: [true, 'Please provide password']
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    followers: {
      type: [mongoose.Types.ObjectId],
      ref: 'user'
    },
    following: {
      type: [mongoose.Types.ObjectId],
      ref: 'user'
    },
    accessToken: {
      type: String
    }
  },
  { timestamps: true }
);

const UserSchema = mongoose.model('user', userSchema);

export = UserSchema;
