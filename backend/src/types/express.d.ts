import { IUserDocument } from '../types';

declare global {
  namespace Express {
    interface Request {
      user?: IUserDocument;
    }
  }
}
