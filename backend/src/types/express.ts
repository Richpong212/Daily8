declare module "express-serve-static-core" {
  interface Request {
    currentUser?: {
      id: string;
      name: string;
      email: string;
      isAdmin: boolean;
    };
  }
}

export {};
