export class RequestMsg {
  Name: string;
  Body: any;
}

export class RespsoneMsg {
  Status: number;
  Error?: string;
  Body?: any;
}

export class LoginResponse {
  Status: number;
  Error?: {
    Error: number;
    ErrorMessage?: string;
    CustomData?: Object;
  };
  Body?: {
    UserId: string;
    CountryCode: string;
    DisplayName: string;
    UserRole: Number;
    CurrentTime: string;
    CreatedAt: string;
  };
}
