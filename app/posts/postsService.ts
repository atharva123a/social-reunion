import { Request, Response } from 'express';
import createAPIError from '../utils/error';
import PostSchema from './postsSchema';
import moment from 'moment';

const createPost = async (req: any, res: Response) => {
  try {
    const { title, description: desc } = req.body;
    const userId = req.user.id;

    const post = await PostSchema.create({ createdBy: userId, title, desc });

    const { createdAt, _id } = post;

    const creationTime = moment(createdAt).format('MMMM Do YYYY, h:mm:ss a');

    return res
      .status(200)
      .json({ success: true, data: { creationTime, title, desc, _id } });
  } catch (error) {
    let err = error.msg || error;
    console.log(err);
    createAPIError(500, err, res);
  }
};

const deletePost = async (req: any, res: Response) => {
  try {
    const postId = req.params.id;

    const userId = req.user.id;

    const post = await PostSchema.findById(postId);

    if (!post) {
      return createAPIError(404, `No such post found!`, res);
    }

    if (post.createdBy.toString() !== userId.toString()) {
      return createAPIError(401, `Can't delete post not created by you!`, res);
    }

    await PostSchema.findByIdAndDelete(postId);

    return res
      .status(200)
      .json({ success: true, message: 'Deleted successfully!' });
  } catch (error) {
    let err = error.msg || error;
    console.log(err);
    createAPIError(500, err, res);
  }
};

const likePost = async (req: any, res: Response) => {
  try {
    const postId = req.params.id;

    const userId = req.user.id;

    const post = await PostSchema.findById(postId);

    if (!post) {
      return createAPIError(404, `No such post found!`, res);
    }

    const updatedPost = await PostSchema.findByIdAndUpdate(
      postId,
      {
        $addToSet: { likes: userId }
      },
      { new: true, runValidators: true }
    );

    if (post.likes.length < updatedPost.likes.length) {
      return res
        .status(200)
        .json({ success: true, message: 'Liked post successfully!' });
    }

    return res.status(200).json({ success: true, message: 'Already liked!' });
  } catch (error) {
    let err = error.msg || error;
    console.log(err);
    createAPIError(500, err, res);
  }
};

const unlikePost = async (req: any, res: Response) => {
  try {
    const postId = req.params.id;

    const userId = req.user.id;

    const post = await PostSchema.findById(postId);

    if (!post) {
      return createAPIError(404, `No such post found!`, res);
    }

    const updatedPost = await PostSchema.findByIdAndUpdate(
      postId,
      {
        $pull: { likes: userId }
      },
      { new: true, runValidators: true }
    );

    if (post.likes.length > updatedPost.likes.length) {
      return res
        .status(200)
        .json({ success: true, message: 'Unlike post successfully!' });
    }

    return res.status(200).json({ success: true, message: 'Already unliked!' });
  } catch (error) {
    let err = error.msg || error;
    console.log(err);
    createAPIError(500, err, res);
  }
};

const commentOnPost = async (req: any, res: Response) => {
  try {
    const postId = req.params.id;

    const userId = req.user.id;

    const { comment } = req.body;

    if (!comment) {
      return createAPIError(400, `Please specify comment!`, res);
    }

    const post = await PostSchema.findById(postId);

    if (!post) {
      return createAPIError(404, `No such post found!`, res);
    }

    post.comments.push({ comment, userId });
    await post.save();

    // latest comment's Id:
    const commentId = post.comments[post.comments.length - 1]['_id'];

    return res.status(200).json({ success: true, commentId });
  } catch (error) {
    let err = error.msg || error;
    console.log(err);
    createAPIError(500, err, res);
  }
};

const getSinglePost = async (req: any, res: Response) => {
  try {
    const postId = req.params.id;

    const post = await PostSchema.findById(postId);

    if (!post) {
      return createAPIError(404, `No such post found!`, res);
    }

    let { _id, title, desc, createdAt, comments, likes } = post;

    let data = {
      _id,
      title,
      desc,
      created_at: moment(createdAt).format('MMMM Do YYYY, h:mm:ss a'),
      comments,
      likes: likes.length
    };

    return res.status(200).json({ success: true, data });
  } catch (error) {
    let err = error.msg || error;
    console.log(err);
    createAPIError(500, err, res);
  }
};

const getAllPosts = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    const posts = await PostSchema.find({ createdBy: userId.toString() })
      .sort({
        createdAt: -1
      })
      .select('_id title desc createdAt comments likes');

    let data = posts.map((post) => {
      let { _id, title, desc, createdAt, comments, likes } = post;

      return {
        _id,
        title,
        desc,
        created_at: moment(createdAt).format('MMMM Do YYYY, h:mm:ss a'),
        comments,
        likes: likes.length
      };
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    let err = error.msg || error;
    console.log(err);
    createAPIError(500, err, res);
  }
};

export = {
  createPost,
  deletePost,
  likePost,
  unlikePost,
  commentOnPost,
  getSinglePost,
  getAllPosts
};
