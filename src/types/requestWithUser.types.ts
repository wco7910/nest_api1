import { Request } from 'express';
import { Users } from 'src/entities/users.entity';

export interface RequestWithUser extends Request {
  user: {
    user_id: string;
    password: string;
    id: Users['id']; // Users 엔티티의 id 타입을 가져옴; // Adjust fields as per your token payload
    email: string;
    roles?: string[];
  };
  headers: {
    profile_id?: string; // profile-id가 있을 수도 있고 없을 수도 있음
    [key: string]: string | string[] | undefined;
  };
}
