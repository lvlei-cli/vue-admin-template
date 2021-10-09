import bo from './bo';
const baseurl = `/portal`;
// 后端暂时没有这个接口，下面接口仅做示例，为了请求成功
const checkToken = {
  api: {
    // url: baseurl + '/checkToken',
    url: baseurl + '/testDrive/testDriveList',
    type: 'postByJson',
    params: {},
    ...bo,
    defaultData: []
  }
};

export default checkToken;

