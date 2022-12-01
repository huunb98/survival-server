import { Router, Request, Response } from 'express';
import { check, validationResult } from 'express-validator';
import MailCMS from '../controllers/mailCms';

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
      console.log(req.body);
      if (req.body.gifts) {
        gifts = req.body.gifts;
        if (typeof gifts != 'object') {
          giftError = true;
        }
      } else gifts = null;
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
      new MailCMS().createMailSystem(title, content, sender, gifts, platform, countryCode, startDate, endDate, (error: string, response: string) => {
        if (error) {
          res.status(400).send(error);
          return;
        }
        res.send(response);
      });
    }
  );

MailRouter.post(
  '/updateMailSystem',
  check('mailId').exists({ checkFalsy: true, checkNull: true }).isLength({ min: 24, max: 24 }),
  check('isActive').exists({ checkNull: true }),
  function (req: Request, res: Response) {
    let error = validationResult(req);
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

    new MailCMS().updateMailSystem(mailId, language, title, content, sender, gifts, platform, countryCode, startDate, endDate, isActive, (error, response) => {
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

    console.log(req.body);
    if (errorList.length) return res.status(400).send('Invalid parameter');

    new MailCMS().getMailDetails(req.body.mailId, req.body.mailType, (error: string, response: string) => {
      if (error) {
        console.log('error');
        res.status(400).send(error);
        return;
      }
      console.log('result');

      res.send(response);
    });
  }
);

export default MailRouter;
