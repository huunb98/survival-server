export enum IPlatform {
  Android,
  IOS,
  All,
}

export interface IMail {
  title: string;
  content: string;
}

export enum MailStatus {
  NEW = 0,
  READ = 1,
  COLLECTED = 2,
  DELETED = 3,
}

export enum TypeReward {
  PVP = 1,
  UpdateVersion = 2,
  AdminPush = 3,
}

export enum UserRole {
  Member,
  Tester,
  Admin,
}

export enum MailType {
  System,
  Update,
  Reward,
}

export class MailSystemResult {
  id: string;
  title: string;
  platform: IPlatform;
  country: string[];
  startDate: Date;
  endDate: Date;
  isDeleted: boolean;
}

export class MailRewardResult {
  id: string;
  title: string;
  expiryDate: number;
  type: TypeReward;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class MailUpdateResult {
  id: string;
  title: string;
  version: number;
  minVersion: number;
  platform: IPlatform;
  isDeleted: boolean;
  startDate: Date;
  endDate: Date;
}

export interface IUserRank {
  Score: number;
  RankNumber: number;
}

export interface TopBPResponse {
  RankNumber: number;
  UserId: string;
  Score: number;
  PlayerData: PvPDataDetails;
}

export interface PvPDataDetails {
  DisplayName: string;
  AvatarUrl: string;
  UserId: string;
}

/**
 * CMS
 */

export enum UserRoleCms {
  NotExist = 0,
  Member = 1,
  Admin = 2,
  Root = 3,
}

export interface LoginResponseCms {
  userName: string;
  accessToken: string;
  role: UserRoleCms;
}

export interface UserJWT {
  user: string;
  role: UserRoleCms;
}
