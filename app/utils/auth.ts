import { isTokenValid } from './jwt';
import { Response, NextFunction } from 'express';
import createAPIError from './error';
import UserSchema from '../user/userSchema';

const authorizeUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    if (!req.headers.authorization || req.headers.authorization.length < 7) {
      return createAPIError(400, 'Please provide the accessToken!', res);
    }

    // get our accessToken which had the bearer prefix:
    const accessToken = req.headers.authorization.split(' ')[1];

    // validate the JWT by verifying signature:
    const { payload, success, message } = isTokenValid(accessToken);
    if (!success) {
      return createAPIError(401, message, res);
    }

    req.user = payload['user'];

    // check if user exists:
    const user = await UserSchema.findById(req.user.id);

    if (!user || user.isDeleted) {
      return createAPIError(404, `No user found with id: ${user.id}`, res);
    }

    return next();
  } catch (error) {
    console.log('HEE?');
    let err = error.msg || error;
    console.log(err);
    createAPIError(401, 'Authentication failed!', res);
  }
};

export { authorizeUser };
