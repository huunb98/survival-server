"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const jwtAuthen_1 = require("../auth/jwt/jwtAuthen");
const catalogType_1 = require("../helpers/catalogType");
const userCmsController_1 = require("../user/userCmsController");
const sanitize = require('mongo-sanitize');
var UserRouter = (0, express_1.Router)();
UserRouter.post('/login', (0, express_validator_1.check)('email').exists({ checkFalsy: true, checkNull: true }).isEmail(), (0, express_validator_1.check)('password').exists({ checkFalsy: true, checkNull: true }), (req, res) => {
    let error = (0, express_validator_1.validationResult)(req);
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
    userCmsController_1.userCmsController.login(email, password, (error, reponse) => {
        if (error)
            return res.send({ code: 0, message: error });
        res.send({ code: 1, data: reponse });
    });
});
UserRouter.post('/register', jwtAuthen_1.jwtAuthenticate.authenticateToken, (0, express_validator_1.check)('userName').exists({ checkFalsy: true, checkNull: true }), (0, express_validator_1.check)('email').exists({ checkFalsy: true, checkNull: true }).isEmail(), (0, express_validator_1.check)('password').exists({ checkFalsy: true, checkNull: true }).isLength({ min: 6 }), (0, express_validator_1.check)('role').exists({ checkFalsy: true, checkNull: true }).isInt(), (req, res) => {
    let error = (0, express_validator_1.validationResult)(req);
    let errorList = error.array();
    if (errorList.length) {
        res.status(400).send({
            code: 0,
            message: errorList,
        });
        return;
    }
    let userRole = res.locals.role;
    if (!userRole || Number(userRole) < catalogType_1.UserRoleCms.Admin || req.body.role > Number(userRole))
        return res.status(403).send({ code: 0, message: 'The requested resource is forbidden' });
    const { userName, email, password, role } = req.body;
    userCmsController_1.userCmsController.createUser(userName, email, password, role, (error, reponse) => {
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
});
exports.default = UserRouter;
//# sourceMappingURL=userRouter.js.map