import { pathOr } from 'ramda';
import bo from './bo';

const user = {
  login: {
    // url: '/authority/account/login',
    url: '/portal/account/login',
    type: 'postByForm',
    params: {},
    ...bo
  },
  logout: {
    url: '/portal/account/logout',
    type: 'postByForm',
    params: {},
    ...bo
  },
  auth: {
    url: '/portal/resource/getAccountResource',
    type: 'get',
    params: {},
    filterData: [
      (r) => {
        const obj = {};
        pathOr([], ['data'], r).forEach((item, i) => {
          obj[item.code] = item;
        });
        r.data = obj;
        return r;
      }
    ],
    ...bo
  },
  resetPassWord: {
    url: '/portal/account/changePassword',
    type: 'postByJson',
    params: {},
    ...bo
  },
  list: { // 用户列表
    url: '/portal/user/list',
    type: 'postByJson',
    params: {},
    // filterIndex:0,
    ...bo,
    defaultData: []
  },
  delete: { // 用户删除
    url: '/portal/user/delete',
    type: 'postByForm',
    params: {},
    // filterIndex:0,
    ...bo,
    defaultData: []
  },
  save: { // 新增
    url: '/portal/user/save',
    type: 'postByJson',
    params: {},
    // filterIndex:0,
    ...bo,
    defaultData: []
  },
  update: { // 用户编辑
    url: '/portal/user/update',
    type: 'postByJson',
    params: {},
    // filterIndex:0,
    ...bo,
    defaultData: []
  },
  detail: { // 用户详情
    url: '/portal/user/detail',
    type: 'get',
    params: {},
    ...bo,
    defaultData: []
  },
  departmentListAll: { // 部门列表
    url: '/portal/department/listAll',
    type: 'get',
    params: {},
    ...bo,
    defaultData: []
  },
  getAccountUserInfo: {
    url: '/portal/user/getAccountUserInfo',
    type: 'postByJson',
    params: {},
    ...bo,
    defaultData: []
  },
  slideCaptchaValidate: {
    url: '/portal/slideCaptcha/validate',
    type: 'get',
    params: {},
    ...bo,
    defaultData: []
  },
  validMsgCode: {
    url: '/portal/account/validMsgCode',
    type: 'postByForm',
    params: {},
    ...bo,
    defaultData: []
  },
  reSetPassword: {
    url: '/portal/account/reSetPassword',
    type: 'postByJson',
    params: {},
    ...bo,
    defaultData: []
  },
  getVerificationCode: {
    url: '/portal/account/getVerificationCode',
    type: 'postByJson',
    params: {},
    ...bo,
    defaultData: []
  }
};
export default user;
