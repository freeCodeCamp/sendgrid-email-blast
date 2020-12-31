export interface blockInt {
  created: number;
  email: string;
  reason: string;
  status: string;
}

export interface bounceInt {
  created: number;
  email: string;
  reason: string;
  status: string;
}

export interface spamInt {
  created: number;
  email: string;
  ip: string;
}
