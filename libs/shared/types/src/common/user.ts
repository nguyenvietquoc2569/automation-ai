export interface IUser {
  id?: string;
  name: string;
  username: string;
  ename: string;
  password: string;
  emailid: string;
  permissions: Array<string>;
  active: boolean;
  title?: string;
  avatar?: string;
  currentOrgId?: string; // Currently active organization
  metaData?: {
    [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export const defaultStaffUser: IUser = {
  name: '',
  username: '',
  ename: '',
  password: '',
  emailid: '',
  permissions: [],
  active: true,
  createdAt: new Date(),
  updatedAt: new Date()
};