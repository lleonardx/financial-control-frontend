export type AuthUser = {
    id: string;
    name: string;
    email: string;
    isActive?: boolean;
  };
  
  export type LoginPayload = {
    email: string;
    password: string;
  };
  
  export type RegisterPayload = {
    name: string;
    email: string;
    password: string;
  };
  
  export type AuthResponse = {
    accessToken: string;
    user: AuthUser;
  };