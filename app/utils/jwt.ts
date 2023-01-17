import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';
import createAPIError from './error';
import { Response } from 'express';

const createJWT = ({ payload }, expiresIn, res: Response) => {
  try {
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn });
    return token;
  } catch (error) {
    let err = error.message || error;
    console.log(err);
    createAPIError(500, err, res);
  }
};

const getTokens = (user, res: Response) => {
  let accessTokenExpiry = '1d';

  let refreshTokenExpiry = '7d';

  const accessTokenJWT = createJWT(
    { payload: { user, type: 'accessToken' } },
    accessTokenExpiry,
    res
  );

  const refreshTokenJWT = createJWT(
    { payload: { user, type: 'refreshToken' } },
    refreshTokenExpiry,
    res
  );

  const accessToken = {
    accessTokenJWT,
    expiresIn: 1000 * 60 * 60 * 24 // 24 hrs!
  };

  const refreshToken = {
    refreshTokenJWT,
    expiresIn: 1000 * 60 * 60 * 24 * 7 // 7 days!
  };

  return { accessToken, refreshToken };
};

const isTokenValid = (token, res: Response) => {
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return payload;
  } catch (err) {
    const error = err.message || err;
    console.log(error);
    return createAPIError(
      401,
      'The token has expired! Please login again!',
      res
    );
  }
};

const validateToken = (token) => {
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
};

const createTokenUser = (user) => {
  const { _id: id, email, username } = user;
  return { id, email, username };
};

export { createJWT, isTokenValid, getTokens, createTokenUser, validateToken };
