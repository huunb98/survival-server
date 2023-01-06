import { MailStatus, MailType } from '../helpers/catalogType';
import { IMailSystemDocument } from '../models/mailSystem';
import { INofityDocument } from '../models/mailUpdate';

export interface UserMailList {
  mailId: string;
  status: MailStatus;
  timeEnd: Number;
  title: string;
  type: MailType;
}
export interface MailCachingStatus {
  mailId: string;
  status: MailStatus;
}
export interface MailSystems {
  data: IMailSystemDocument;
  status: MailStatus;
}

export interface MailUpdates {
  data: INofityDocument;
  status: MailStatus;
}

export interface GiftResponse {
  key: string;
  value: number;
}

export interface GetMailDetailResponse {
  sender: string;
  status: MailStatus;
  title: string;
  content: string;
  timeEnd: Number;
  gifts: GiftResponse[];
  type: MailType;
}
