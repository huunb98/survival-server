"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const catalogType_1 = require("../helpers/catalogType");
const mailCms_1 = __importDefault(require("../mails/mailCms"));
const mailManager_1 = require("../mails/mailManager");
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
    // console.log(req.body);
    if (req.body.gifts) {
        gifts = req.body.gifts;
        if (typeof gifts != 'object') {
            giftError = true;
        }
    }
    else
        gifts = null;
    if (errorList.length || giftError)
        return res.status(400).send('Invalid parameter');
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
    if (errorList.length)
        return res.status(400).send('Invalid parameter');
    const { mailId, sender, language, title, content, gifts, platform, countryCode, startDate, endDate, isActive } = req.body;
    new mailCms_1.default().updateMailSystem(mailId, language, title, content, sender, gifts, platform, countryCode, startDate, endDate, isActive, (error, response) => {
        if (error)
            return res.status(400).send(error);
        res.send(response);
    });
});
MailRouter.route('/mailUpdate')
    .get((0, express_validator_1.check)('language').exists({ checkFalsy: true, checkNull: true }), function (req, res) {
    //console.log('get mail update request', req.query);
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
        // console.log('rs mail update', response);
        res.send(response);
    });
})
    .post((0, express_validator_1.check)('content').exists({ checkFalsy: true, checkNull: true }), (0, express_validator_1.check)('title').exists({ checkFalsy: true, checkNull: true }), (0, express_validator_1.check)('endDate').exists({ checkFalsy: true, checkNull: true }), (0, express_validator_1.check)('version').exists({ checkFalsy: true, checkNull: true }), function (req, res) {
    let error = (0, express_validator_1.validationResult)(req);
    let errorList = error.array();
    let giftError = false;
    let gifts = new Map();
    //  console.log(req.body);
    if (req.body.gifts) {
        gifts = req.body.gifts;
        if (typeof gifts != 'object') {
            giftError = true;
        }
    }
    else
        gifts = null;
    if (errorList.length || giftError)
        return res.status(400).send('Invalid parameter');
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
    if (errorList.length)
        return res.status(400).send('Invalid parameter');
    const { mailId, language, title, content, gifts, platform, version, minVersion, startDate, endDate, isActive } = req.body;
    new mailCms_1.default().updateMailNotifyUpdate(mailId, language, title, content, gifts, version, minVersion, platform, startDate, endDate, isActive, (error, response) => {
        if (error)
            return res.status(400).send(error);
        res.send(response);
    });
});
MailRouter.route('/mailReward')
    .get((0, express_validator_1.check)('language').exists({ checkFalsy: true, checkNull: true }), function (req, res) {
    // console.log('get mail reward request', req.query);
    let error = (0, express_validator_1.validationResult)(req);
    let errorList = error.array();
    if (errorList.length)
        return res.status(400).send('Invalid parameter');
    const { language, skip, limit } = req.query;
    new mailCms_1.default().getMailReward(language, skip, limit, (error, response) => {
        if (error) {
            res.status(400).send(error);
            return;
        }
        //  console.log('rs mail reward', response);
        res.send(response);
    });
})
    .post((0, express_validator_1.check)('type').exists({ checkFalsy: true, checkNull: true }), (0, express_validator_1.check)('content').exists({ checkFalsy: true, checkNull: true }), (0, express_validator_1.check)('title').exists({ checkFalsy: true, checkNull: true }), (0, express_validator_1.check)('expiryDate').exists({ checkFalsy: true, checkNull: true }), function (req, res) {
    //   console.log(req.body);
    let error = (0, express_validator_1.validationResult)(req);
    let errorList = error.array();
    let giftError = false;
    let gifts = new Map();
    //  console.log(req.body);
    if (req.body.gifts) {
        gifts = req.body.gifts;
        if (typeof gifts != 'object') {
            giftError = true;
        }
    }
    else
        gifts = null;
    if (errorList.length || giftError)
        return res.status(400).send('Invalid parameter');
    const { sender, title, content, type, expiryDate } = req.body;
    new mailCms_1.default().createMailReward(title, content, sender, type, gifts, expiryDate, (error, response) => {
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
    if (errorList.length)
        return res.status(400).send('Invalid parameter');
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
    // console.log(req.body);
    if (errorList.length)
        return res.status(400).send('Invalid parameter');
    new mailCms_1.default().getMailDetails(req.body.mailId, req.body.mailType, (error, response) => {
        if (error) {
            res.status(400).send(error);
            return;
        }
        res.send(response);
    });
});
MailRouter.post('/sendToUser', (0, express_validator_1.check)('userId').exists({ checkFalsy: true, checkNull: true }).isLength({ min: 24, max: 24 }), (0, express_validator_1.check)('title').exists({ checkNull: true }), (0, express_validator_1.check)('content').exists({ checkNull: true }), (0, express_validator_1.check)('endDate').exists({ checkNull: true }), (req, res) => {
    let error = (0, express_validator_1.validationResult)(req);
    let errorList = error.array();
    let giftError = false;
    let gifts = new Map();
    // console.log(req.body);
    if (req.body.gifts) {
        gifts = req.body.gifts;
        if (typeof gifts != 'object') {
            giftError = true;
        }
    }
    else
        gifts = null;
    if (errorList.length || giftError) {
        res.status(400).send(error);
        return;
    }
    const { userId, title, content, endDate } = req.body;
    mailManager_1.mailManager.sendRewardToUser(userId, catalogType_1.TypeReward.AdminPush, title, content, gifts, null, null, endDate, (error, results) => {
        if (error)
            return res.status(400).send('Send to user error');
        res.send('Send mail to user succeed');
    });
});
MailRouter.post('/reloadConfig', (req, res) => {
    mailManager_1.mailManager.reloadConfig();
    res.send({
        Status: 1,
        Body: {},
    });
});
exports.default = MailRouter;
//# sourceMappingURL=mailRouter.js.map