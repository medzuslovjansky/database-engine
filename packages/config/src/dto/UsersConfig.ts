export type UsersConfig = Record<UserID, UserConfig>;

export type UserID = string;

export type UserConfig = {
  email: string;
  comment: string;
};
