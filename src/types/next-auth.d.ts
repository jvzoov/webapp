import type { UserRole } from './database';

declare module 'next-auth' {
  interface Session {
    user: {
      id:             string;
      name:           string;
      email:          string;
      role:           UserRole;
      avatarInitials: string;
      phone:          string;
    };
  }

  interface User {
    role:           UserRole;
    avatarInitials: string;
    phone:          string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id:             string;
    role:           UserRole;
    avatarInitials: string;
    phone:          string;
  }
}
