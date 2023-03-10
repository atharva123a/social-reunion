import { Request, Response } from 'express';
import createAPIError from '../utils/error';
import UserSchema from './userSchema';
import { createTokenUser, getTokens, validateToken } from '../utils/jwt';

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
        return res.status(200).json({ success: true, jwt: user.accessToken });
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

    const { username, followers, following } = await UserSchema.findById(
      userId
    ).select('username followers following');

    let [numOfFollowers, numOfFollowing] = [followers.length, following.length];

    return res.status(200).json({
      success: true,
      data: { username, numOfFollowers, numOfFollowing }
    });
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

    if (followerId.toString() == userId.toString()) {
      return createAPIError(400, `You can't follow/unfollow yourself!`, res);
    }

    const user = await UserSchema.findById(userId);

    if (!user || user.isDeleted) {
      return createAPIError(404, `No such user found to follow!`, res);
    }

    const follower = await UserSchema.findById(followerId);

    const updatedUser = await UserSchema.findByIdAndUpdate(
      userId,
      {
        $addToSet: { followers: followerId }
      },
      { new: true, runValidators: true }
    );

    if (updatedUser.followers.length > user.followers.length) {
      follower.following.push(userId.toString());
      await follower.save();
      return res
        .status(200)
        .json({ success: true, message: 'Followed successfully!' });
    }

    return res
      .status(200)
      .json({ success: true, message: 'Already followed!' });
  } catch (error) {
    let err = error.msg || error;
    console.log(err);
    createAPIError(500, err, res);
  }
};

const unfollowUser = async (req: any, res: Response) => {
  try {
    // this is from the JWT:
    const unfollowerId = req.user.id;

    // this is from params:
    const userId = req.params.id;

    if (unfollowerId.toString() == userId.toString()) {
      return createAPIError(400, `You can't follow/unfollow yourself!`, res);
    }

    const user = await UserSchema.findById(userId);

    if (!user || user.isDeleted) {
      return createAPIError(404, `No such user found to unfollow!`, res);
    }

    const unfollower = await UserSchema.findById(unfollowerId);

    const updatedUser = await UserSchema.findByIdAndUpdate(
      userId,
      {
        $pull: { followers: unfollowerId }
      },
      { new: true, runValidators: true }
    );

    // there was an unfollow action:
    if (updatedUser.followers.length < user.followers.length) {
      unfollower.following = unfollower.following.filter(
        (item) => item != userId.toString()
      );
      await unfollower.save();
      return res
        .status(200)
        .json({ success: true, message: 'Unfollowed successfully!' });
    }

    return res
      .status(200)
      .json({ success: true, message: 'Already unfollowed!' });
  } catch (error) {
    let err = error.msg || error;
    console.log(err);
    createAPIError(500, err, res);
  }
};

export = { authenticateUser, getUser, followUser, unfollowUser };
