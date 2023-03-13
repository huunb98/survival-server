import { Router, Request, Response } from 'express';
import { check, validationResult } from 'express-validator';
import { version } from 'os';
import { TypeReward } from '../helpers/catalogType';
import MailCMS from '../mails/mailCms';
import { mailManager } from '../mails/mailManager';

var MailRouter = Router();

MailRouter.route('/mailSystem')
  .get(check('language').exists({ checkFalsy: true, checkNull: true }), function (req: Request, res: Response) {
    let error = validationResult(req);
    let errorList = error.array();

    if (errorList.length) return res.status(400).send('Invalid parameter');

    const { language, skip, limit } = req.query;
    new MailCMS().getMailSystem(language, skip, limit, (error: string, response: string) => {
      if (error) {
        res.status(400).send(error);
        return;
      }
      res.send(response);
    });
  })
  .post(
    check('sender').exists({ checkFalsy: true, checkNull: true }),
    check('content').exists({ checkFalsy: true, checkNull: true }),
    check('title').exists({ checkFalsy: true, checkNull: true }),
    check('endDate').exists({ checkFalsy: true, checkNull: true }),
    function (req: Request, res: Response) {
      let error = validationResult(req);
      let errorList = error.array();

      let giftError = false;
      let gifts: Map<string, number> = new Map();
      // console.log(req.body);
      if (req.body.gifts) {
        gifts = req.body.gifts;
        if (typeof gifts != 'object') {
          giftError = true;
        }
      } else gifts = null;
      if (errorList.length || giftError) return res.status(400).send('Invalid parameter');

      const { title, content, sender, platform, countryCode, startDate, endDate } = req.body;
      new MailCMS().createMailSystem(title, content, sender, gifts, platform, countryCode, startDate, endDate, (error: string, response: string) => {
        if (error) {
          res.status(400).send(error);
          return;
        }
        res.send(response);
      });
    }
  )
  .put(
    check('mailId').exists({ checkFalsy: true, checkNull: true }).isLength({ min: 24, max: 24 }),
    check('isActive').exists({ checkNull: true }),
    function (req: Request, res: Response) {
      let error = validationResult(req);
      let errorList = error.array();

      if (errorList.length) return res.status(400).send('Invalid parameter');
      const { mailId, sender, language, title, content, gifts, platform, countryCode, startDate, endDate, isActive } = req.body;

      new MailCMS().updateMailSystem(mailId, language, title, content, sender, gifts, platform, countryCode, startDate, endDate, isActive, (error, response) => {
        if (error) return res.status(400).send(error);
        res.send(response);
      });
    }
  );

MailRouter.route('/mailUpdate')
  .get(check('language').exists({ checkFalsy: true, checkNull: true }), function (req: Request, res: Response) {
    //console.log('get mail update request', req.query);
    let error = validationResult(req);
    let errorList = error.array();

    if (errorList.length) return res.status(400).send('Invalid parameter');

    const { language, skip, limit } = req.query;
    new MailCMS().getMailUpdate(language, skip, limit, (error: string, response: string) => {
      if (error) {
        res.status(400).send(error);
        return;
      }
      // console.log('rs mail update', response);
      res.send(response);
    });
  })
  .post(
    check('content').exists({ checkFalsy: true, checkNull: true }),
    check('title').exists({ checkFalsy: true, checkNull: true }),
    check('endDate').exists({ checkFalsy: true, checkNull: true }),
    check('version').exists({ checkFalsy: true, checkNull: true }),
    function (req: Request, res: Response) {
      let error = validationResult(req);
      let errorList = error.array();

      let giftError = false;
      let gifts: Map<string, number> = new Map();
      //  console.log(req.body);
      if (req.body.gifts) {
        gifts = req.body.gifts;
        if (typeof gifts != 'object') {
          giftError = true;
        }
      } else gifts = null;
      if (errorList.length || giftError) return res.status(400).send('Invalid parameter');

      const { title, content, platform, version, minVersion, startDate, endDate } = req.body;
      new MailCMS().createMailUpdate(title, content, gifts, version, minVersion, platform, startDate, endDate, (error: string, response: string) => {
        if (error) {
          res.status(400).send(error);
          return;
        }
        res.send(response);
      });
    }
  )
  .put(
    check('mailId').exists({ checkFalsy: true, checkNull: true }).isLength({ min: 24, max: 24 }),
    check('isActive').exists({ checkNull: true }),
    function (req: Request, res: Response) {
      let error = validationResult(req);
      let errorList = error.array();

      if (errorList.length) return res.status(400).send('Invalid parameter');
      const { mailId, language, title, content, gifts, platform, version, minVersion, startDate, endDate, isActive } = req.body;

      new MailCMS().updateMailNotifyUpdate(mailId, language, title, content, gifts, version, minVersion, platform, startDate, endDate, isActive, (error, response) => {
        if (error) return res.status(400).send(error);
        res.send(response);
      });
    }
  );

MailRouter.route('/mailReward')
  .get(check('language').exists({ checkFalsy: true, checkNull: true }), function (req: Request, res: Response) {
    // console.log('get mail reward request', req.query);
    let error = validationResult(req);
    let errorList = error.array();

    if (errorList.length) return res.status(400).send('Invalid parameter');

    const { language, skip, limit } = req.query;
    new MailCMS().getMailReward(language, skip, limit, (error: string, response: string) => {
      if (error) {
        res.status(400).send(error);
        return;
      }
      //  console.log('rs mail reward', response);
      res.send(response);
    });
  })
  .post(
    check('type').exists({ checkFalsy: true, checkNull: true }),
    check('content').exists({ checkFalsy: true, checkNull: true }),
    check('title').exists({ checkFalsy: true, checkNull: true }),
    check('expiryDate').exists({ checkFalsy: true, checkNull: true }),
    function (req: Request, res: Response) {
      //   console.log(req.body);
      let error = validationResult(req);
      let errorList = error.array();

      let giftError = false;
      let gifts: Map<string, number> = new Map();
      //  console.log(req.body);
      if (req.body.gifts) {
        gifts = req.body.gifts;
        if (typeof gifts != 'object') {
          giftError = true;
        }
      } else gifts = null;
      if (errorList.length || giftError) return res.status(400).send('Invalid parameter');

      const { sender, title, content, type, expiryDate } = req.body;
      new MailCMS().createMailReward(title, content, sender, type, gifts, expiryDate, (error: string, response: string) => {
        if (error) {
          res.status(400).send(error);
          return;
        }
        res.send(response);
      });
    }
  )
  .put(
    check('mailId').exists({ checkFalsy: true, checkNull: true }).isLength({ min: 24, max: 24 }),
    check('isActive').exists({ checkNull: true }),
    function (req: Request, res: Response) {
      let error = validationResult(req);
      let errorList = error.array();

      if (errorList.length) return res.status(400).send('Invalid parameter');
      const { mailId, language, title, content, gifts, platform, version, minVersion, startDate, endDate, isActive } = req.body;

      new MailCMS().updateMailNotifyUpdate(mailId, language, title, content, gifts, version, minVersion, platform, startDate, endDate, isActive, (error, response) => {
        if (error) return res.status(400).send(error);
        res.send(response);
      });
    }
  );

MailRouter.post(
  '/mailDetail',
  check('mailId').exists({ checkFalsy: true, checkNull: true }),
  check('mailType').exists({ checkNull: true }),

  function (req: Request, res: Response) {
    let error = validationResult(req);
    let errorList = error.array();

    // console.log(req.body);
    if (errorList.length) return res.status(400).send('Invalid parameter');

    new MailCMS().getMailDetails(req.body.mailId, req.body.mailType, (error: string, response: string) => {
      if (error) {
        res.status(400).send(error);
        return;
      }

      res.send(response);
    });
  }
);

MailRouter.post(
  '/sendToUser',
  check('userId').exists({ checkFalsy: true, checkNull: true }).isLength({ min: 24, max: 24 }),
  check('title').exists({ checkNull: true }),
  check('content').exists({ checkNull: true }),
  check('endDate').exists({ checkNull: true }),
  (req, res) => {
    let error = validationResult(req);
    let errorList = error.array();

    let giftError = false;
    let gifts: Map<string, number> = new Map();
    // console.log(req.body);
    if (req.body.gifts) {
      gifts = req.body.gifts;
      if (typeof gifts != 'object') {
        giftError = true;
      }
    } else gifts = null;
    if (errorList.length || giftError) {
      res.status(400).send(error);
      return;
    }
    const { userId, title, content, endDate } = req.body;
    mailManager.sendRewardToUser(userId, TypeReward.AdminPush, title, content, gifts, null, null, endDate, (error, results) => {
      if (error) return res.status(400).send('Send to user error');

      res.send('Send mail to user succeed');
    });
  }
);

MailRouter.post('/reloadConfig', (req, res) => {
  mailManager.reloadConfig();
  res.send({
    Status: 1,
    Body: {},
  });
});

export default MailRouter;
