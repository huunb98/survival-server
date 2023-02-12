import { jwtAuthenticate } from '../auth/jwt/jwtAuthen';
import { BcryptHelper } from '../helpers/bcrypt';
import { UserRoleCms, LoginResponseCms, UserJWT } from '../helpers/catalogType';
import { UserCmsModel } from '../models/usercms';

class UserCmsController {
  async createUser(userName: string, email: string, password: string, role: UserRoleCms, callback: Function) {
    let newUser = new UserCmsModel();
    newUser.userName = userName;
    newUser.email = email;
    newUser.password = await new BcryptHelper().encode(password);
    newUser.role = role;

    newUser
      .save()
      .then((result) => {
        callback(null, result);
      })
      .catch((error) => {
        callback(error, null);
      });
  }

  login(email: string, password: string, callback: Function) {
    UserCmsModel.findOne({ email: email })
      .then(async (user) => {
        if (user) {
          let validPassword = await new BcryptHelper().compareHash(password, user.password);
          if (!validPassword) return callback('Email not found or password is invalid', null);

          let userJWT: UserJWT = {
            user: user.id,
            role: user.role,
          };

          let accessToken = jwtAuthenticate.generateAccessToken(userJWT);
          let loginRes: LoginResponseCms = {
            userName: user.userName,
            accessToken: accessToken,
            role: user.role,
          };
          callback(null, loginRes);
        } else {
          callback('Email not found or password is invalid', null);
        }
      })
      .catch((error) => {
        callback('Database error', null);
      });
  }
}

export const userCmsController = new UserCmsController();
