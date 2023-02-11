import { jwtAuthenticate } from '../auth/jwt/jwtAuthen';
import { UserRoleCms, LoginResponse, UserJWT } from '../helpers/catalogType';
import { UserCmsModel } from '../models/usercms';

class UserCmsController {
  async createUser(userName: string, email: string, password: string, role: UserRoleCms, adminId: string, callback: Function) {
    let userRole = await this.getPermission(adminId);
    if (userRole < role) return callback('Not permission', null);
    let newUser = new UserCmsModel();
    newUser.userName = userName;
    newUser.email = email;
    newUser.password = password;
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
    UserCmsModel.findOne({ email: email, password: password })
      .then((user) => {
        if (user) {
          let userJWT: UserJWT = {
            user: user.id,
          };
          let accessToken = jwtAuthenticate.generateAccessToken(userJWT);
          let loginRes: LoginResponse = {
            userName: user.userName,
            accessToken: accessToken,
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

  getPermission(id: string): Promise<UserRoleCms> {
    return new Promise<UserRoleCms>((resolve, reject) =>
      UserCmsModel.findOne({ _id: id }, { role: 1, _id: 0 })
        .then((user) => {
          if (user) resolve(user.role);
          else resolve(UserRoleCms.NotExist);
        })
        .catch((error) => {
          console.log(error);
          reject(UserRoleCms.NotExist);
        })
    );
  }
}

export const userCmsController = new UserCmsController();
