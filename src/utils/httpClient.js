// eslint-disable-next-line no-unused-vars
import Vue from 'vue';
import axios from 'axios';
import { Loading, Message } from 'element-ui';
import qs from 'qs';
// import { Observable } from 'rxjs';
// import { retry, map as rxMap } from 'rxjs/operators'; // throttle
import { pipe, pathOr, pick/*, is, compose, fromPairs, map, split*/ } from 'ramda';
import { getToken, removeToken } from './auth';

import checkToken from '@/apiMap/checkToken';

let loadinginstace;
const _loading = {
  _count: 0,
  get count(){
    return this._count;
  },
  set count(val){
    // if (val < 0) {
    //   console.log(`val------------------------------>${val}`);
    // }
    if ((val = Math.max(val, 0)) === 0) {
      setTimeout(() => {
        this.count === 0 ? loadinginstace && loadinginstace.close() : null;
      }, 100)
    } else loadinginstace = Loading.service({ fullscreen: true });
    this._count = val;
  }
}
window._adminLoading = _loading;

const baseUrl = '/api/';
const checkTokenResponse_false = {
  status: 200,
  data: {
    data: { checkResult: false },
    success: true
  }
};
const noToastCodeList = ['401']; // 不需要进行提示的接口状态
// if (emptyNames.includes(window.location.hostname) && process.env.NODE_ENV === 'development') {
// if (process.env.NODE_ENV === 'development') {
//   baseUrl = '/api/'
// }

// console.log('baseUrl--------------->', baseUrl)

// axios.defaults.baseURL = process.env.NODE_ENV === 'development' ? `/api/` : ''

// axios.defaults.baseURL = baseUrl
// axios.defaults.timeout = 60000
const setDefaultData = (defaultData, response) => r => {
  r.data = pathOr(defaultData, ['data', 'data'], response);
  return r;
};
const bmwAxios = axios.create({
  baseURL: baseUrl,
  timeout: 60000
});
const makeData = pick(['pageNumber', 'pageSize', 'total', 'data', 'success', 'message', 'code']);

bmwAxios.interceptors.request.use(config => {
  const token = getToken();
  if (token){
    config.headers['token'] = token;
    config.headers['source'] = 'P';
  }
  // console.log('mwAxios.interceptors.request.use--------->', config)
  // 防止cdn缓存-2019-12-02 22:40
  config.params = {
    _t: Date.parse(new Date()) / 1000,
    ...config.params
  };

  // console.log('axios.interceptors.request.use--------------->', config)
//   console.log('getToken', getToken());
  // window.token   into herder
  return config;
}, error => {
  Message.error({
    message: '加载超时'
  });
  console.log(error); // for debug
  Promise.reject(error);
});

bmwAxios.interceptors.response.use(
  response => {
    //  TODO 添加 接口返回---200 但是 status为500 有msg

    if (response.data.success === false){
      const msg = pathOr(`服务器异常`, ['data', 'message'], response);
      switch (response.data.code){
        case '401':
          removeToken();
          window.$router.replace({
            path: '/login',
            query: {
              // redirect: window.$router.currentRoute.fullPath
            }
          });
          break;
      }
      if (!noToastCodeList.includes(response.data.code)){ // 隐藏 token过期的toast
        Message.error({
          message: msg,
          dangerouslyUseHTMLString: true
        });
      }
    }
    return response;
  }, (error) => {
    // loadinginstace.close();
    _loading.count = 0;
    const msg = pathOr(`服务器异常`, ['response', 'statusText'], error);
    console.log('error.response-------------------->', error.response);
    Message.error({
      message: msg
    });
    console.log(error);
    return Promise.reject(error.response); // 返回接口返回的错误信息
  }
);

function falseDataSuccess(url, resolve, reject, filterData, defaultData, fn, isCheckedToken, isGo, fakeParams){
  const response = {
    status: 200,
    data: {
      data: {
        fakeParams
      },
      pageNumber: 1,
      pageSize: 10,
      total: 20,
      success: true
    }
  };
  isCheckedToken ? response.data.data.checkResult = isGo : '';
  fn(url, response, resolve, reject, filterData, defaultData);
}

// function falseDataSuccessRx(url, subscriber, filterData, defaultData, fn){
//     const response = {
//         status: 200,
//         data: {
//             data: {},
//             pageNumber: 1,
//             pageSize: 10,
//             total: 11,
//             success: true
//         }
//     };
//     fn(url, response, subscriber, filterData, defaultData)
// }
function checkTokenFn(){
  var { api } = checkToken;
  api.setParams({ token: getToken() });
  return methods.postByJson(api);
  // return methods.get(api)
}

const methods = {
  // successForRx(url, response, subscriber, filterData = [], defaultData){
  //   switch (response.status){
  //     case 200:
  //       // xxxx
  //       if (filterData.length){
  //         filterData = [setDefaultData(defaultData, response), makeData, ...filterData];
  //
  //         // eslint-disable-next-line no-case-declarations
  //         const fdfn = pipe(...filterData);
  //         subscriber.next(fdfn(response.data));
  //       } else {
  //         filterData = [setDefaultData(defaultData, response), makeData];
  //
  //         // eslint-disable-next-line no-case-declarations
  //         const fdfn = pipe(...filterData);
  //         subscriber.next(fdfn(response.data));
  //       }
  //       break;
  //     default:
  //       break;
  //   }
  // },
  success(url, response, resolve, reject, filterData = [], defaultData){
    if (response.status === 200){
      // console.log('response--------------->',response.data);
      // resolve(response.data);

      if (filterData.length){
        filterData = [setDefaultData(defaultData, response), makeData, ...filterData];

        const fdfn = pipe(...filterData);

        resolve(fdfn(response.data));
      } else {
        filterData = [setDefaultData(defaultData, response), makeData];

        const fdfn = pipe(...filterData);

        resolve(fdfn(response.data));
      }
    } else {
      reject && reject(response);
    }
    // setTimeout(() => {
    //   // loadinginstace && loadinginstace.close();
    //   if (toggle) _loading.count--;
    // }, 0);
  },
  get(options, toggle = true){
    // console.log("httpClient.get---------toggle------>",toggle)
    const { url, params = {}, filterData, defaultData } = options;
    return new Promise(async(resolve, reject) => {
      const me = this;

      let isGo = true;
      if (options.isCheckedToken){
        const response = await checkTokenFn().catch((err) => {
          console.log('校验token失败', err);
        });
        isGo = pathOr(false, ['success'], response);
      }

      if (options.isFakeData){
        falseDataSuccess(url, resolve, reject, filterData, defaultData, me.success, options.isCheckedToken, isGo, params);
        return;
      }

      if (toggle) _loading.count++;

      if (!isGo){
        const response = checkTokenResponse_false;
        me.success(url, response, resolve, reject, filterData, defaultData);
        return;
      }

      bmwAxios.get(url, {
        params
      }).then((response) => {
        if (toggle) _loading.count--;
        me.success(url, response, resolve, reject, filterData, defaultData);
      }).catch((response) => {
        if (toggle) _loading.count--;
        reject(response);
      });
    });
  },
  postByForm(options, toggle = true){
    const { url, params = {}, filterData, defaultData } = options;
    return new Promise(async(resolve, reject) => {
      const me = this;

      let isGo = true;
      if (options.isCheckedToken){
        const response = await checkTokenFn().catch((err) => {
          console.log('校验token失败', err);
        });
        isGo = pathOr(false, ['success'], response);
      }

      if (options.isFakeData){
        falseDataSuccess(url, resolve, reject, filterData, defaultData, me.success, options.isCheckedToken, isGo, params);
        return;
      }

      if (toggle) _loading.count++;

      if (!isGo){
        const response = checkTokenResponse_false;
        me.success(url, response, resolve, reject, filterData, defaultData);
        return;
      }

      bmwAxios.post(url, qs.stringify(params), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((response) => {
        if (toggle) _loading.count--;
        me.success(url, response, resolve, reject, filterData, defaultData);
      }).catch((response) => {
        if (toggle) _loading.count--;
        reject(response);
      });
    });
  },
  postByJson(options, toggle = true){
    const { url, params = {}, filterData, defaultData } = options;
    // console.log(url,params,filterData,filterIndex);
    return new Promise(async(resolve, reject) => {
      const me = this;

      let isGo = true;
      if (options.isCheckedToken){
        const response = await checkTokenFn().catch((err) => {
          console.log('校验token失败', err);
        });
        isGo = pathOr(false, ['success'], response);
      }

      if (options.isFakeData){
        falseDataSuccess(url, resolve, reject, filterData, defaultData, me.success, options.isCheckedToken, isGo, params);
        return;
      }

      if (toggle) _loading.count++;

      if (!isGo){
        const response = checkTokenResponse_false;
        me.success(url, response, resolve, reject, filterData, defaultData);
        return;
      }

      bmwAxios.post(url, params, {
        headers: {
          'Content-Type': 'application/json;charset=UTF-8'
        }
      }).then((response) => {
        if (toggle) _loading.count--;
        me.success(url, response, resolve, reject, filterData, defaultData);
      }).catch((response) => {
        if (toggle) _loading.count--;
        reject(response);
      });
    });
  },
  download(options, toggle = true){
    const { url, params = {}} = options;
    const { fileType = 'xlsx', fileName = 'excel' } = options.fileOptions;
    return new Promise((resolve, reject) => {
      if (toggle){
        _loading.count++;
      }
      bmwAxios.post(url, params, { responseType: 'blob' })
        .then((response) => {
          if (toggle) _loading.count--;
          // 在指定了接口返回为文件流时，response里面接收不到返回的json（目前是这样）
          const blob = response.data;
          const fileFullName = `${fileName}.${String(fileType).toLowerCase()}`;
          if (window.navigator.msSaveOrOpenBlob){
            window.navigator.msSaveBlob(blob, fileFullName);
          } else {
            const a = document.createElement('a');
            a.download = fileFullName;
            a.href = window.URL.createObjectURL(blob);
            a.click();
          }
          resolve(response); // 如果成功了response.data返回Blob的json
          return false;
        })
        .catch((response) => {
          if (toggle) _loading.count--;
          reject(response);
        });
    });
  },
  postByJsonBlob(options, toggle = true){
    const { url, params = {}} = options;
    return new Promise((resolve, reject) => {
      if (toggle){
        _loading.count++;
      }
      bmwAxios.post(url, params, { responseType: 'blob' })
        .then((response) => {
          if (toggle) _loading.count--;
          // 在指定了接口返回为文件流时，response里面接收不到返回的json（目前是这样）
          const blob = response.data;
          if (blob.size) resolve(window.URL.createObjectURL(blob)); // 如果成功了response.data返回Blob的json
          else reject()
        })
        .catch((response) => {
          if (toggle) _loading.count--;
          reject(response);
        });
    });
  },
  postByFormBlob(options, toggle = true){
    const { url, params = {}} = options;
    return new Promise((resolve, reject) => {
      if (toggle){
        _loading.count++;
      }
      bmwAxios.post(url, qs.stringify(params), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        responseType: 'blob'
      }).then((response) => {
          if (toggle) _loading.count--;
          const blob = response.data;
          resolve(window.URL.createObjectURL(blob));
        })
        .catch((response) => {
          if (toggle) _loading.count--;
          reject(response);
        });
    });
  }
  // putByJson(options, toggle = true){
  //   const { url, params = {}, filterData, defaultData } = options;
  //   // console.log(url,params,filterData,filterIndex);
  //   return new Promise((resolve, reject) => {
  //     const me = this;
  //
  //     if (options.isFakeData){
  //       falseDataSuccess(url, resolve, reject, filterData, defaultData, me.success);
  //       return;
  //     }
  //
  //     if (toggle){
  //       _loading.count++;
  //     }
  //     bmwAxios.put(url, params, {
  //       headers: {
  //         'Content-Type': 'application/json;charset=UTF-8'
  //       }
  //     }).then((response) => {
  //       if (toggle) _loading.count--;
  //       me.success(url, response, resolve, reject, filterData, defaultData);
  //     }).catch((response) => {
  //       reject(response);
  //       if (toggle) _loading.count--;
  //     });
  //   });
  // },
  // getByRx(options, toggle = true){
  //   const { url, params = {}, filterData = [], defaultData } = options;
  //   const me = this;
  //   const $ajax = Observable.create(subscriber => {
  //     if (toggle){
  //       // loadinginstace = Loading.service({ fullscreen: true });
  //       _loading.count++;
  //     }
  //     bmwAxios.get(url, params).then(r => {
  //       console.log('r---------->', r);
  //       me.successForRx(url, r, subscriber, filterData, defaultData);
  //     }).catch(e => {
  //       subscriber.error(e);
  //     });
  //   });
  //   return $ajax.pipe(
  //     retry(1), // 重试
  //     rxMap(r => r.data) // 过滤数据
  //   );
  // },
  // postByRx(options, toggle = true){
  //   const { url, params = {}, filterData = [], defaultData } = options;
  //   const me = this;
  //   const $ajax = Observable.create(subscriber => {
  //     if (toggle){
  //       // loadinginstace = Loading.service({ fullscreen: true });
  //       _loading.count++;
  //     }
  //     bmwAxios.post(url, params, {
  //       headers: {
  //         'Content-Type': 'application/json;charset=UTF-8'
  //       }
  //     }).then(r => {
  //       console.log('r---------->', r);
  //       me.successForRx(url, r, subscriber, filterData, defaultData);
  //     }).catch(e => {
  //       subscriber.error(e);
  //     });
  //   });
  //   return $ajax.pipe(
  //     retry(1), // 重试
  //     rxMap(r => r.data) // 过滤数据
  //   );
  // },
  // postReturnBase64(options, toggle = true){
  //   const { url, params = {}} = options;
  //   return new Promise((resolve, reject) => {
  //     if (toggle){
  //       // loadinginstace = Loading.service({ fullscreen: true });
  //       _loading.count++;
  //     }
  //     bmwAxios.post(url, qs.stringify(params), { responseType: 'blob' })
  //       .then((response) => {
  //         const blob = response.data;
  //         var reader = new FileReader();
  //         reader.readAsDataURL(blob);
  //         reader.onload = function(e) {
  //           // loadinginstace && loadinginstace.close();
  //           if (toggle) _loading.count--;
  //           resolve(e.target.result);
  //         }
  //       }).catch((response) => {
  //       reject(response);
  //       // loadinginstace && loadinginstace.close();
  //       if (toggle) _loading.count--;
  //       console.log('服务器请求失败');
  //     });
  //   });
  // }
};

const fn = function(options, toggle){
  return methods[options.type].apply(methods, arguments);
};
Object.assign(fn, methods);
export default fn;
