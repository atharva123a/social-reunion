import { Request, Response } from 'express';
import createAPIError from '../utils/error';
import UserSchema, { update } from './userSchema';
import { createTokenUser, getTokens, validateToken } from '../utils/jwt';

const DUMMY_EMAIL = 'athens@gmail.com';
const DUMMY_PASSWORD = '12345678';

const authenticateUser = async (req: any, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return createAPIError(400, `Please provide email and password`, res);
    }

    // here we use a dummy email and password, so all emails and password are valid:
    let user = await UserSchema.findOne({ email });

    // in case the user does not exist, we simply create another one:
    if (!user) {
      // we create a dummy username also for the user:
      let username = email.split('@')[0];
      user = await UserSchema.create({ email, password, username });
    } else {
      if (user.password !== password) {
        return createAPIError(401, "Passwords don't match!", res);
      }

      const { success } = validateToken(user.accessToken);

      // if the token is valid, we return the saved token:
      if (success) {
        return res.status(200).json({ success: true, data: user.accessToken });
      }
    }
    // if not we simply generate another token and save it:

    const tokenUser = createTokenUser(user);

    const { accessToken } = getTokens(tokenUser, res);
    const { accessTokenJWT } = accessToken;

    user.accessToken = accessTokenJWT;
    await user.save();

    return res.status(200).json({ success: true, jwt: accessTokenJWT });
  } catch (error) {
    let err = error.msg || error;
    console.log(err);
    createAPIError(500, err, res);
  }
};

const getUser = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    const user = await UserSchema.findById(userId);

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    let err = error.msg || error;
    console.log(err);
    createAPIError(500, err, res);
  }
};

const followUser = async (req: any, res: Response) => {
  try {
    // this is from the JWT:
    const followerId = req.user.id;

    // this is from params:
    const userId = req.params.id;

    const user = await UserSchema.findById(userId);

    if (!user || user.isDeleted) {
      return createAPIError(404, `No such user found to follow!`, res);
    }

    let updatedFollowerList = user.followers.filter(
      (follower) => follower != followerId.toString()
    );

    if (updatedFollowerList.length == user.followers.length) {
      // followers was not following this person before:
      updatedFollowerList.push(followerId.toString());

      user.followers = updatedFollowerList;
      await user.save();
    }

    return res
      .status(200)
      .json({ success: true, message: 'Followed successfully!' });

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    let err = error.msg || error;
    console.log(err);
    createAPIError(500, err, res);
  }
};

export = { authenticateUser, getUser, followUser };
