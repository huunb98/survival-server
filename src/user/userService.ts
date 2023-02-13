import { RequestMsg, RespsoneMsg } from '../io/IOInterface';
import { UserModel } from '../models/user';
import { UserInfo } from './userInfo';

class UserService {
  SetAvatar(userInfo: UserInfo, msg: RequestMsg, fn: (res: RespsoneMsg) => void) {
    let _avatar = msg.Body.Avatar;
    if (_avatar == null || _avatar == undefined) {
      fn({
        Status: 0,
        Error: 'Invalid parameter',
      });
      return;
    }

    UserModel.updateOne({ _id: userInfo.UserId }, { $set: { avatar: _avatar } })
      .then((_) => {
        fn({
          Status: 1,
        });
      })
      .catch((error) => {
        console.log(error);
        fn({
          Status: 0,
          Error: 'Database error',
        });
      });
  }

  SetName(userInfo: UserInfo, msg: RequestMsg, fn: (res: RespsoneMsg) => void) {
    let displayName = msg.Body.DisplayName;
    if (!displayName) {
      fn({
        Status: 0,
        Error: 'Invalid parameter',
      });
      return;
    }

    UserModel.updateOne({ _id: userInfo.UserId }, { $set: { displayName: displayName } })
      .then((sucess) => {
        fn({
          Status: 1,
        });
      })
      .catch((error) => {
        console.log(error);
        fn({
          Status: 0,
          Error: 'Database error',
        });
      });
  }

  GetBasicInfo(userId: string, callback: Function) {
    UserModel.findById(userId, { avatar: 1, displayName: 1, _id: 0 })
      .then((user) => {
        if (user) {
          callback(null, {
            avatar: user.avatar,
            displayName: user.displayName,
          });
        } else {
          callback('user not found', null);
        }
      })
      .catch((error) => {
        console.log(error);
        callback('server is error', null);
      });
  }
}

export const userService = new UserService();
