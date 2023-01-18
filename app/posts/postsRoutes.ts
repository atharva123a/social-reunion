import Router from 'express';
import { authorizeUser } from '../utils/auth';
import validateRequest from '../middleware/validateType';
import { postDetails } from './postsInterface';
import PostService from './postsService';

export const router = Router();

router.post(
  '/posts',
  authorizeUser,
  validateRequest(postDetails),
  PostService.createPost
);

router.delete('/posts/:id', authorizeUser, PostService.deletePost);

// Like/Unlike a post:
router.post('/like/:id', authorizeUser, PostService.likePost);
router.post('/unlike/:id', authorizeUser, PostService.unlikePost);

// Comment on post:
router.post('/comment/:id', authorizeUser, PostService.commentOnPost);

// this route is unprotected:
router.get('/posts/:id', PostService.getSinglePost);
// returns all post created by the user:
router.get('/posts', authorizeUser, PostService.getAllPosts);
