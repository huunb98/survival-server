import { Router, Response, Request } from 'express';
import { check, validationResult } from 'express-validator';
import { jwtAuthenticate } from '../auth/jwt/jwtAuthen';
import { UserRoleCms } from '../helpers/catalogType';
import { LoginResponse } from '../io/IOInterface';
import { userCmsController } from '../user/userCmsController';

const sanitize = require('mongo-sanitize');

var UserRouter = Router();

UserRouter.post(
  '/login',
  check('email').exists({ checkFalsy: true, checkNull: true }).isEmail(),
  check('password').exists({ checkFalsy: true, checkNull: true }),
  (req: Request, res: Response) => {
    let error = validationResult(req);
    let errorList = error.array();
    if (errorList.length) {
      res.status(400).send({
        message: 'Invalid parameter',
      });
      return;
    }

    /**
     * Securing mongodb injection attack
     */
    sanitize(req.body);

    const { email, password } = req.body;
    userCmsController.login(email, password, (error: string, reponse: LoginResponse) => {
      if (error) return res.send({ code: 0, message: error });
      res.send({ code: 1, data: reponse });
    });
  }
);

UserRouter.post(
  '/register',
  jwtAuthenticate.authenticateToken,
  check('userName').exists({ checkFalsy: true, checkNull: true }),
  check('email').exists({ checkFalsy: true, checkNull: true }).isEmail(),

  check('password').exists({ checkFalsy: true, checkNull: true }).isLength({ min: 6 }),
  check('role').exists({ checkFalsy: true, checkNull: true }).isInt(),
  (req: Request, res: Response) => {
    let error = validationResult(req);
    let errorList = error.array();
    if (errorList.length) {
      res.status(400).send({
        code: 0,
        message: errorList,
      });
      return;
    }

    let userRole = res.locals.role;

    if (!userRole || Number(userRole) < UserRoleCms.Admin || req.body.role > Number(userRole))
      return res.status(403).send({ code: 0, message: 'The requested resource is forbidden' });

    const { userName, email, password, role } = req.body;
    userCmsController.createUser(userName, email, password, role, (error, reponse) => {
      if (error)
        return res.send({
          code: 0,
          message: error,
        });
      res.send({
        code: 1,
        data: 'Create user succeed',
      });
    });
  }
);

export default UserRouter;
