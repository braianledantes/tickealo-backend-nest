export interface JwtPayload {
  sub: number;
  username: string;
  roles: string[];
  iat: number;
  exp: number;
}
