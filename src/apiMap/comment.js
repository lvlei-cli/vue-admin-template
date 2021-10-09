import bo from './bo';
const baseUrl = '/portal';
export default {
  templateSaveUpdate: {
    // 新增更新评价模板
    url: `${baseUrl}/comment/template/save-update`,
    type: 'postByJson',
    params: {},
    ...bo
  },
  templateQuery: {
    // 查询评价模板(列表和详情)
    url: `${baseUrl}/comment/template/query`,
    type: 'postByJson',
    params: {},
    ...bo
  },
  templateDelete: {
    // 删除评价模板
    url: `${baseUrl}/comment/template/delete`,
    type: 'postByJson',
    params: {},
    ...bo
  },
  templateUpdateStatus: {
    // 修改评论模板状态接口
    url: `${baseUrl}/comment/template/update-status`,
    type: 'postByJson',
    params: {},
    ...bo
  },
  // 审核评价
  approve: {
    url: `${baseUrl}/comment/comment-approve`,
    type: 'postByJson',
    params: {},
    ...bo,
    defaultData: []
  },
  // 评价详情
  detail: {
    url: `${baseUrl}/comment/detail`,
    type: 'postByJson',
    params: {},
    ...bo,
    defaultData: []
  },
  // 查询评价列表
  query: {
    url: `${baseUrl}/comment/query`,
    type: 'postByJson',
    params: {},
    ...bo,
    defaultData: []
  }
};
