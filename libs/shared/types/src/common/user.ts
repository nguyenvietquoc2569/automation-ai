export interface IUser {
  name: string,
  username: string,
  ename: string,
  password: string,
  emailid: string,
  permissions: Array<string>,
  active: boolean,
  title?: string,
  avatar?: string,
  metaData?: {
    [key: string]: any} // eslint-disable-line @typescript-eslint/no-explicit-any
  createdAt?: Date,
}

export const defaultStaffUser: IUser = {
  name: '',
  username: '',
  ename: '',
  password: '',
  emailid: '',
  permissions: [],
  active: true,
  createdAt: new Date()
}