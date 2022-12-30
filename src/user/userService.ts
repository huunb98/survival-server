import { RequestMsg, RespsoneMsg } from '../io/IOInterface';
import { UserModel } from '../models/user';
import { UserInfo } from './userInfo';

class UserService {
  SetName(userInfo: UserInfo, msg: RequestMsg, fn: (res: RespsoneMsg) => void) {
    console.log(msg);
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
}

export const userService = new UserService();
