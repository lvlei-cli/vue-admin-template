// import { login, logout, getInfo } from '@/apiMap/user'
import user from '@/apiMap/user'
// import common from '@/apiMap/common';
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'
import httpClient from '@/utils/httpClient.js';

const state = {
  token: getToken(),
  name: '',
  avatar: '',
  accountResource: '',
  SMS_target: {} // 是否开启全平台短信验证（目前登录 和 修改密码 需要短信验证）这里是一个数据字典对象，用getters取结果值
}

const mutations = {
  SET_TOKEN: (state, token) => {
    // console.log('SET_TOKEN--------------state------------->', state)
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ACCOUNTRESOURCE: (state, accountResource) => {
    state.accountResource = accountResource
  },
  SET_SMSTARGET: (state, SMS_target) => {
    state.SMS_target = SMS_target
  }
}

const actions = {
  // user login
  login({ commit }, { username, password, captchaValue, captchaId, authCode }) {
    return new Promise((resolve, reject) => {
      const params = {
        account: username,
        password,
        captchaValue,
        captchaId,
        authCode
      };
      const userLogin = user.login;
      userLogin.setParams(params);
      httpClient.postByForm(userLogin).then((res) => {
        if (res.success === true) {
          setToken(res.data);
          commit('SET_TOKEN', res.data);
          resolve(res)
        } else {
          reject(res);
        }
      }).catch(error => {
        console.log(error);
        reject(error)
      })
    })
  },
  // get auth tree
  getAccountResource({ commit, state }) {
    return new Promise((resolve, reject) => {
      const userAuth = user.auth;
      httpClient.get(userAuth, false).then((res) => {
        // console.log('getAccountResource---------------->', res);
        if (res.success === true) {
          commit('SET_ACCOUNTRESOURCE', res.data);
          resolve(res.data)
        } else {
          reject('error');
        }
      }).catch(error => {
        console.log(error);
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      commit('SET_TOKEN', '')
      commit('SET_ACCOUNTRESOURCE', '') // 清掉权限
      removeToken()
      resetRouter()
      // window.location.reload();
      resolve()
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      removeToken()
      resolve()
    })
  },

  // SMS_target
  getSMSTarget({ commit }){
    return new Promise((resolve, reject) => {
      // const detailByCode = common.operationDictionary.detailByCode;
      const detailByCode = user.validMsgCode;
      var params = { code: 'MessageAuthCode' };
      detailByCode.setParams(params);
      httpClient(detailByCode).then(res => {
        if (res.success) {
          commit('SET_SMSTARGET', res.data)
          resolve(res)
        } else {
          reject('error');
        }
      }).catch((err) => {
        reject(err)
      })
    })
  }
}

const getters = {
  // accountResource: userInfo => {
  //  return userInfo.accountResource
  // }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}

