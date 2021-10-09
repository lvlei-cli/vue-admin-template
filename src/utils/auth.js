import Cookies from 'js-cookie'

const TokenKey = 'bmwToken';
import store from '../store'
// console.log(`auth中的store====>`, store)
import { pathOr } from 'ramda';
export function getToken() {
  if (window.localStorage) {
    const storeToken = pathOr('', ['getters', 'token'], store);
    // console.log(`storeToken`, storeToken)
    return storeToken || window.localStorage.getItem(TokenKey)
  } else {
    return Cookies.get(TokenKey)
  }
}

export function setToken(token) {
  if (window.localStorage) {
    window.localStorage.setItem(TokenKey, token)
  } else {
    return Cookies.set(TokenKey, token)
  }
}

export function removeToken() {
  if (window.localStorage) {
    window.localStorage.removeItem(TokenKey)
  } else {
    return Cookies.remove(TokenKey)
  }
}

