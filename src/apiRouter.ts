import { Router } from 'express';
import { jwtAuthenticate } from './auth/jwt/jwtAuthen';
import MatchingPVP from './pvp/Matching';
import MailRouter from './routers/mailRouter';
import PvPRouter from './routers/pvpRouter';
import UserRouter from './routers/userRouter';

var ApiRouter = Router();

ApiRouter.use('/match', MatchingPVP);
ApiRouter.use('/mail', jwtAuthenticate.authenticateToken, MailRouter);
ApiRouter.use('/pvp', jwtAuthenticate.authenticateToken, PvPRouter);
ApiRouter.use('/user', UserRouter);

export default ApiRouter;
