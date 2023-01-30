"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const mailCms_1 = __importDefault(require("../mails/mailCms"));
var MailRouter = (0, express_1.Router)();
MailRouter.route('/mailSystem')
    .get((0, express_validator_1.check)('language').exists({ checkFalsy: true, checkNull: true }), function (req, res) {
    let error = (0, express_validator_1.validationResult)(req);
    let errorList = error.array();
    if (errorList.length)
        return res.status(400).send('Invalid parameter');
    const { language, skip, limit } = req.query;
    new mailCms_1.default().getMailSystem(language, skip, limit, (error, response) => {
        if (error) {
            res.status(400).send(error);
            return;
        }
        res.send(response);
    });
})
    .post((0, express_validator_1.check)('sender').exists({ checkFalsy: true, checkNull: true }), (0, express_validator_1.check)('content').exists({ checkFalsy: true, checkNull: true }), (0, express_validator_1.check)('title').exists({ checkFalsy: true, checkNull: true }), (0, express_validator_1.check)('endDate').exists({ checkFalsy: true, checkNull: true }), function (req, res) {
    let error = (0, express_validator_1.validationResult)(req);
    let errorList = error.array();
    let giftError = false;
    let gifts = new Map();
    console.log(req.body);
    if (req.body.gifts) {
        gifts = req.body.gifts;
        if (typeof gifts != 'object') {
            giftError = true;
        }
    }
    else
        gifts = null;
    if (errorList.length || giftError) {
        res.send({
            Status: 0,
            Body: {
                Err: 'Invalid parameter',
            },
        });
        return;
    }
    const { title, content, sender, platform, countryCode, startDate, endDate } = req.body;
    new mailCms_1.default().createMailSystem(title, content, sender, gifts, platform, countryCode, startDate, endDate, (error, response) => {
        if (error) {
            res.status(400).send(error);
            return;
        }
        res.send(response);
    });
})
    .put((0, express_validator_1.check)('mailId').exists({ checkFalsy: true, checkNull: true }).isLength({ min: 24, max: 24 }), (0, express_validator_1.check)('isActive').exists({ checkNull: true }), function (req, res) {
    let error = (0, express_validator_1.validationResult)(req);
    let errorList = error.array();
    if (errorList.length) {
        res.send({
            Status: 0,
            Body: {
                Err: 'Invalid parameter',
            },
        });
        return;
    }
    const { mailId, sender, language, title, content, gifts, platform, countryCode, startDate, endDate, isActive } = req.body;
    new mailCms_1.default().updateMailSystem(mailId, language, title, content, sender, gifts, platform, countryCode, startDate, endDate, isActive, (error, response) => {
        if (error)
            return res.status(400).send(error);
        res.send(response);
    });
});
MailRouter.route('/mailUpdate')
    .get((0, express_validator_1.check)('language').exists({ checkFalsy: true, checkNull: true }), function (req, res) {
    console.log('get mail update request', req.query);
    let error = (0, express_validator_1.validationResult)(req);
    let errorList = error.array();
    if (errorList.length)
        return res.status(400).send('Invalid parameter');
    const { language, skip, limit } = req.query;
    new mailCms_1.default().getMailUpdate(language, skip, limit, (error, response) => {
        if (error) {
            res.status(400).send(error);
            return;
        }
        console.log('rs mail update', response);
        res.send(response);
    });
})
    .post((0, express_validator_1.check)('content').exists({ checkFalsy: true, checkNull: true }), (0, express_validator_1.check)('title').exists({ checkFalsy: true, checkNull: true }), (0, express_validator_1.check)('endDate').exists({ checkFalsy: true, checkNull: true }), (0, express_validator_1.check)('version').exists({ checkFalsy: true, checkNull: true }), function (req, res) {
    let error = (0, express_validator_1.validationResult)(req);
    let errorList = error.array();
    let giftError = false;
    let gifts = new Map();
    console.log(req.body);
    if (req.body.gifts) {
        gifts = req.body.gifts;
        if (typeof gifts != 'object') {
            giftError = true;
        }
    }
    else
        gifts = null;
    if (errorList.length || giftError) {
        res.send({
            Status: 0,
            Body: {
                Err: 'Invalid parameter',
            },
        });
        return;
    }
    const { title, content, platform, version, minVersion, startDate, endDate } = req.body;
    new mailCms_1.default().createMailUpdate(title, content, gifts, version, minVersion, platform, startDate, endDate, (error, response) => {
        if (error) {
            res.status(400).send(error);
            return;
        }
        res.send(response);
    });
})
    .put((0, express_validator_1.check)('mailId').exists({ checkFalsy: true, checkNull: true }).isLength({ min: 24, max: 24 }), (0, express_validator_1.check)('isActive').exists({ checkNull: true }), function (req, res) {
    let error = (0, express_validator_1.validationResult)(req);
    let errorList = error.array();
    if (errorList.length) {
        res.send({
            Status: 0,
            Body: {
                Err: 'Invalid parameter',
            },
        });
        return;
    }
    const { mailId, language, title, content, gifts, platform, version, minVersion, startDate, endDate, isActive } = req.body;
    new mailCms_1.default().updateMailNotifyUpdate(mailId, language, title, content, gifts, version, minVersion, platform, startDate, endDate, isActive, (error, response) => {
        if (error)
            return res.status(400).send(error);
        res.send(response);
    });
});
MailRouter.post('/mailDetail', (0, express_validator_1.check)('mailId').exists({ checkFalsy: true, checkNull: true }), (0, express_validator_1.check)('mailType').exists({ checkNull: true }), function (req, res) {
    let error = (0, express_validator_1.validationResult)(req);
    let errorList = error.array();
    console.log(req.body);
    if (errorList.length)
        return res.status(400).send('Invalid parameter');
    new mailCms_1.default().getMailDetails(req.body.mailId, req.body.mailType, (error, response) => {
        if (error) {
            console.log('error');
            res.status(400).send(error);
            return;
        }
        console.log('result');
        res.send(response);
    });
});
exports.default = MailRouter;
//# sourceMappingURL=mailRouter.js.map