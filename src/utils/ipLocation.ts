import { UserModel } from '../models/user';
import { UserInfo } from '../user/userInfo';
import * as geoip from 'geoip-lite';

class IPLocation {
  SaveLocation(userId, ipAdress: string, deviceId: string, userInfo: UserInfo) {
    if (userInfo.User.timZone) {
      UserModel.updateOne(
        {
          _id: userId,
        },
        {
          lastIp: ipAdress,
          lastLogin: new Date(),
        }
      )
        .then(function (rowsUpdated) {
          //  console.log(rowsUpdated);
        })
        .catch((error) => console.log(error));
    } else {
      var geo = geoip.lookup(ipAdress);
      if (!geo) {
        geo = geoip.lookup('66.249.79.183');
      }
      let timezone = geo.timezone;
      let country = geo.country;
      UserModel.updateOne(
        {
          _id: userId,
        },
        {
          countryCode: country,

          lastIp: ipAdress,
          lastLogin: new Date(),
          timeZone: timezone,
          deviceId: deviceId,
        }
      )
        .then(function (rowsUpdated) {
          //    console.log(rowsUpdated);
        })
        .catch((error) => console.log(error));

      userInfo.CountryCode = country;
    }
  }
}
export const ipLocation = new IPLocation();
