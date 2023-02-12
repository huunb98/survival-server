import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { UserJWT } from '../../helpers/catalogType';

class JwtAuthenticate {
  /**
   * Access Token 1 day
   * @param user
   * @returns
   */
  generateAccessToken(user: UserJWT) {
    return jwt.sign(user, process.env.ServerAccessToken, {
      algorithm: 'HS384',
      expiresIn: '1d',
    });
  }

  generateRefreshToken(user: UserJWT) {
    return jwt.sign(user, process.env.ServerRefreshToken, {
      algorithm: 'HS384',
      expiresIn: '60d',
    });
  }

  authenticateToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token)
      return res.status(401).send({
        code: 0,
        data: null,
        message: 'Token missing',
      });
    jwt.verify(token, process.env.ServerAccessToken, (err, response: UserJWT) => {
      if (err)
        return res.status(403).send({
          code: 0,
          data: err,
          message: 'Forbiden',
        });
      res.locals.user = response.user;
      res.locals.role = response.role;
      next();
    });
  }
}

export const jwtAuthenticate = new JwtAuthenticate();
