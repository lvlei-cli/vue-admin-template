// 处理业务逻辑的函数且脱离this
// 待优化 @kai.fu

/*
  目的:传入中间数据，传出可选属性的列
  创建时间:2019-10-05
  作者:zhangweixin
*/
import httpClient from '@/utils/httpClient.js';
import sort from '@/components/sort/sort';
import { v4 as uuidv4 } from 'uuid';
import customer from '@/apiMap/customer';
const { detail: resourceDetail } = customer;
export function filterPackageData(params) {
  var m = [];
  console.log('接收的数组', params);
  if (params.length > 0) {
    params.forEach((item, index) => {
      m.push(item.data);
    });
  }
  return m;
}
export function filterPackageDropData(params) {
  var n = [];
  if (params.length > 0) {
    params[0].forEach((v, i) => {
      if (v.id != 'package') {
        n.push({ value: v.id, label: v.value });
      }
    });
    //  item.data.forEach((item,i)=>{
    //    n.push({value:item.id,label:item.value});
    //  })
  }
  return n;
}
/*
  目的:生成cpList
  创建时间:2019-10-05
  作者:gaoyu
*/
export function createCpList(selectKey, originData) {
  const cpList = [];
  let skuData = [];
  // if (selectKey.length == 0) {
  //   console.log('cpList', cpList)
  //   return cpList
  // }
  for (const data of originData) {
    for (const item of data) {
      if (item.value === '车款') {
        skuData.push(item);
      }
      for (const key of selectKey) {
        if (item.id === key.value) {
          skuData.push(item);
        }
      }
    }
    cpList.push(skuData);
    skuData = [];
  }
  console.log('cpList', cpList);
  return cpList;
}

/**
 * 目的:替换对象的某个属性名
 */
export function attrReName(data, oldName, newName) {
  return JSON.parse(JSON.stringify(data).replace(new RegExp(oldName, 'g'), newName));
}

export function setFullName(data, fullName, fullCode = '') {
  data.map((item, k) => {
    item.fullName = fullName ? fullName + '>>' + item.name : '';
    item.fullCode = fullCode ? fullCode + '>>' + item.code : '';
    if (item.children) {
      setFullName(item.children, item.fullName, item.fullCode);
    }
  });
}

/*
  @purpose 深度优先遍历  id相等的node
  @createTime2019-10-12 15:48
  @author miles_fk
*/
const findLevelInfo = function findLevelInfo(id, node) {
  if (node.id == id) {
    return node;
  } else {
    for (let index = 0; index < node.child.length; index++) {
      const sonNode = node.child[index];
      if (sonNode.id == id) return node;
      const okNode = findLevelInfo(id, sonNode);
      if (okNode) return okNode;
    }
  }
};
/*
  @purpose 深度优先遍历  id相等的node
  @createTime2019-10-12 15:48
  @author miles_fk
  @ 传入当前子节点ID和整个树的对象
*/
export function findLevelInfoForChild(id, node) {
  if (node.id == id) {
    return node;
  } else {
    if (node.children) {
      for (let index = 0; index < node.children.length; index++) {
        const sonNode = node.children[index];
        if (sonNode.id == id) return sonNode;
        const okNode = findLevelInfoForChild(id, sonNode);
        if (okNode) return okNode;
      }
    }
  }
}
/*
  @purpose  找到ID 对应的 递归上级
  @返回子例子  ['苹果','手机','科技']
  @createTime2019-10-12 15:48
  @author miles_fk
*/
export function getLevelInfo(id, treeNode) {
  const levelLink = [];
  let nextNode = {};
  let isFind = true;
  let count = 0;
  while (isFind) {
    if (count > 10000) return;
    if (nextNode.pid == -1) {
      isFind = false;
    } else {
      const nextNodeInfo = findLevelInfo(id, treeNode);
      if (nextNodeInfo) {
        levelLink.push(nextNodeInfo);
        id = nextNodeInfo.pid;
      }
      nextNode = nextNodeInfo;
    }
    count++;
  }
  return levelLink;
}

function makeNodeItem(node, option, map) {
  map[node.id] = {
    id: node.id,
    name: node.name,
    code: node.code,
    pid: node.parent.id,
    children: node.children ? node.children.map(sonNode => sonNode) : []
  };

  for (let index = 0; index < option.length; index++) {
    const nodeKey = option[index];
    map[node.id][nodeKey] = node[nodeKey];
  }
}
/*
    @purpose tree 拍平 变成一个 map(使用深度优先遍历)
    @createTime 2019-10-16 20:22:38
    @author miles_fk
*/
export function treeToMapForDF(treeNode, option = [], map = {}) {
  // 生成需要的自定义的node
  makeNodeItem(treeNode, option, map);

  if (treeNode.children && treeNode.children.length > 0) {
    for (let index = 0; index < treeNode.children.length; index++) {
      const sonNode = treeNode.children[index];
      treeToMapForDF(sonNode, option, map);
    }
  }
  return map;
}

/*
    @purpose tree 拍平 变成一个 map(使用广度优先遍历)
    @createTime 2019-10-16 20:22:38
    @author miles_fk
*/
export function treeToMapForBF(treeNode, option = [], map = {}) {
  let rowNodeList = treeNode.children;
  const link = [];

  makeNodeItem(treeNode, option, map);

  link.push(map[treeNode.id]);

  while (rowNodeList && rowNodeList.length > 0) {
    const node = rowNodeList.shift(0);

    // 生成需要的自定义的node
    makeNodeItem(node, option, map);

    link.push(map[node.id]);
    rowNodeList = rowNodeList.concat(node.children);
  }
  console.log('link--------------------->', link);
  return map;
}

/*
    @purpose 根据Id 找到他的递归父级路径 map传整棵树
    @createTime 2019-10-16 20:22:38
    @author miles_fk
*/
export function findNodePath(id, map, path = []) {
  const curNode = map[id];
  // path.push(curNode)
  path.unshift(curNode);
  if (curNode) {
    if (curNode.pid == 0) {
      return path;
    } else {
      return findNodePath(curNode.pid, map, path);
    }
  }
}

export function findNodePathFromList(idList, map, path = []) {
  return idList.reduce((total, item) => {
    return [...total, ...[findNodePath(item, map, [])]];
  }, path);
}

export function treeToMapForDFfromList(treeNodeList, option = [], map = {}) {
  return treeNodeList.reduce((total, item) => {
    return {
      ...total,
      ...treeToMapForDF(item, option, {})
    };
  }, map);
}

export function getImgSize(file) {
  if (file) {
    return new Promise(resolve => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file); // 根据图片路径读取图片  转为base64格式
      fileReader.onload = function() {
        const base64 = this.result;
        const img = new Image();
        img.src = base64;
        img.onload = function() {
          const { width, height } = img;
          resolve({
            width,
            height
          });
        };
      };
    });
  }
}

export function judgementSize(file, { width = '', height = '' }, float = 2) {
  if (file) {
    return new Promise(resolve => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file); // 根据图片路径读取图片  转为base64格式
      fileReader.onload = function() {
        const base64 = this.result;
        const img = new Image();
        img.src = base64;
        img.onload = function() {
          const b = (width ? width - float <= img.width && img.width <= width + float : true) && (height ? height - float <= img.height && img.height <= height + float : true);
          resolve(b);
        };
      };
    });
  }
}
export function sortArr(arr, str) {
  var map = {};
  var dest = [];
  for (var i = 0; i < arr.length; i++) {
    var ai = arr[i];
    if (!map[ai[str]]) {
      dest.push({
        groupCode: ai[str],
        groupName: ai.optionGroupName,
        data: [ai]
      });
      map[ai[str]] = ai;
    } else {
      for (var j = 0; j < dest.length; j++) {
        var dj = dest[j];
        if (dj[str] === ai[str]) {
          dj.data.push(ai);
          break;
        }
      }
    }
  }
  return dest;
}

export function uuid() {
  return uuidv4().replace(/-/g, '');
}

export function getNowFormatDate() {
  var date = new Date();
  var seperator1 = '/';
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var strDate = date.getDate();
  if (month >= 1 && month <= 9) {
    month = '0' + month;
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = '0' + strDate;
  }
  var currentdate = year + seperator1 + month + seperator1 + strDate;
  return currentdate;
}

// 获取数据字典
export function getDictionaryWithCode(code, load = true) {
  return new Promise(resolve => {
    import('@/apiMap/common').then(_ => {
      const { dictionary } = _.default;
      const params = { code };
      dictionary.setParams(params);
      httpClient(dictionary, load).then(res => {
        res.success && resolve(res.data);
      });
    });
  });
}

// 查找数组中的某个值
export function findItemFromArray(arr, value, code) {
  if (Array.isArray(arr)) {
    return arr.find(item => {
      return code ? item[code] == value : item == value;
    });
  }
}

// 根据id查找某个子级元素
// treeList 树形list集合
// ids可以是单个的id（字符串，返回一个单个的对象） 也可以是一个数组 （返回一个数组）
export function getCurrentItemFromTreeList(treeList, ids) {
  function mapTreeList(treeList, map = {}) {
    return treeList.reduce((total, item) => {
      if (item.children && item.children.length) {
        mapTreeList(item.children, map);
      }
      total[item.id] = item;
      return total;
    }, map);
  }
  return typeof ids == 'object'
    ? ids.map(itemId => {
        return mapTreeList(treeList)[itemId];
      })
    : mapTreeList(treeList)[ids];
}

export function listToMap(list, [value, name] = ['value', 'name']){ // 一般用于数据字典的map转换
  const o = {};
  list.forEach((item) => {
    o[item[value]] = item[name];
  })
  return o;
}

export function handleCopy(content) { // 复制内容到剪切板
  if (document.execCommand) {
    var input = document.createElement("input");
    input.value = content;
    document.body.appendChild(input);
    input.select();
    document.execCommand("Copy");
    document.body.removeChild(input);
    return true;
  }
  return false;
}

export function validateForPrice(price){ // 价格正则验证
  const ex = /(^[1-9][0-9]{0,7}$)|(^((0\.0[1-9]$)|(^0\.[1-9]\d?)$)|(^[1-9][0-9]{0,7}\.\d{1,2})$)/;
  return !!price && ex.test(price);
}

export function isOverdue(date){ // 目标时间是否小于当前时间(是否超期)
  if (!date) return false;
  date = typeof date == 'number' ? date : date.replace(/-/g, '/')
  return new Date(date).getTime() < Date.now();
}

export function initSortParams(options){ // 列表排序初始化参数（按接口格式）
  return Object.keys(options).map((item) => {
    const { params: sortParam = item, order: sortRules } = options[item];
    return {
      sortParam,
      sortRules
    }
  }).filter(({ sortRules }) => {
    return !!sortRules
  })
}

export function renderHeaderForElTable(sortParams, callback){ // 表头通用的renderHeader
  return function(h, { column: { label, property }}){
    return h('span', {
      style: {
        'white-space': 'nowrap'
      }
    }, [
      label,
      h(sort, {
        props: {
          defaultSort: sortParams[property]
        },
        on: {
          sortChange: () => {
            callback && callback(property)
          }
        }
      })
    ])
  }
}

export function downloadTemplate(code){
  var params = {
    code,
    "contentDisposition": "",
    "contentType": ""
  };
  resourceDetail.setParams(params);
  httpClient(resourceDetail).then(res => {
    if (res.success) {
      window.open(res.data.dataUrl)
    }
  });
}
