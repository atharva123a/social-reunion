import Router from 'express';
import { Request, Response } from 'express';
import UserService from './userService';
import { authorizeUser } from '../utils/auth';

export const router = Router();

router.get('/user', authorizeUser, UserService.getUser);
router.post('/authenticate', UserService.authenticateUser);

router.post('/follow/:id', authorizeUser, UserService.followUser);
