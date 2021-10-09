import qs from 'qs';

var bo = {
  setParams: function(target){
    // for in 循环
    this.params = target;
    for (const k in target){
      this.params[k] = target[k];
    }
  },
  setFileOptions: function(options = {}){ // 用于更改 下载excel类型的fileOptions
    this.fileOptions = options;
  },
  setParamsToUrl: function(obj) { // 在地址后加参数，采用postByJson方法
    this.url = this.url.split('?')[0] + '?' + qs.stringify(obj);
  }
};

export default bo;
