<template>
  <div class="login-container">
    <el-form
      ref="loginForm"
      :model="loginForm"
      :rules="loginRules"
      class="login-form"
      auto-complete="off"
      label-position="left"
    >
      <el-row :gutter="0" class="home_tj_row">
        <el-col :xs="{ span: 24 }" :sm="{ span: 20, offset: 2 }" class="title-container">
          <p>欢迎来到</p>
          <p class="name">BMW官方商城</p>
          <p>后台管理系统</p>
          <img class="logo" src="@/assets/logo.png" alt="" />
        </el-col>
      </el-row>
      <el-row class="login-cont">
        <el-col :xs="{ span: 24 }" :sm="{ span: 20, offset: 2 }">
          <div class="login-tips">
            请使用BMW官方商城账号登录
          </div>
          <div class="form-cont">
            <el-form-item prop="username">
              <!--              <span class="svg-container">-->
              <!--                <svg-icon icon-class="user" />-->
              <!--              </span>-->
              <el-input
                ref="username"
                v-model="loginForm.username"
                placeholder="用户名"
                name="username"
                type="text"
                tabindex="1"
                auto-complete="off"
              />
            </el-form-item>

            <el-form-item prop="password">
              <!--              <span class="svg-container">-->
              <!--                <svg-icon icon-class="password" />-->
              <!--              </span>-->
              <el-input
                :key="passwordType"
                ref="password"
                v-model="loginForm.password"
                :type="passwordType"
                placeholder="密码"
                name="password"
                tabindex="2"
                auto-complete="off"
                @keyup.enter.native="handleLogin"
              >
                <span slot="append" class="show-pwd" @click="showPwd">
                  <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
                </span>
              </el-input>
            </el-form-item>
            <el-form-item v-if="needSMS" prop="authCode">
              <SMSInput :id="loginForm.username" :sms-code.sync="loginForm.authCode" />
            </el-form-item>
            <!-- <el-form-item prop="captchaValue">
              <span class="svg-container">
              </span>
              <el-input
                ref="code"
                v-model="loginForm.captchaValue"
                placeholder="验证码"
                @keyup.enter.native="handleLogin"
              />
              <span class="show-code" @click="getCode">
                <img :src="codeImg">
              </span>
            </el-form-item> -->
            <PicValidator
              ref="picValidator"
              :captcha-id.sync="loginForm.captchaId"
              :captcha-value.sync="loginForm.captchaValue"
              :pic-valid="picValid"
              :on-close="picValidClose"
              :on-show="picValidShow"
              :on-success="picValidSuccess"
            />
            <el-button
              :loading="loading"
              type="primary"
              style="width:100%;"
              @click.native.prevent="handleLogin"
            >登录
            </el-button>
          </div>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script>
  import { validUsername } from '@/utils/validate';
  import { removeToken, setToken } from '@/utils/auth';
  export default {
    name: 'Login',
    components: {
      PicValidator: () => import(/* webpackChunkName: "aftersales" */ '@/components/PicValidator/PicValidator'),
      SMSInput: () => import('@/components/SMSInput/SMSInput')
    },
    data() {
      const validateUsername = (rule, value, callback) => {
        if (!validUsername(value)) {
          callback(new Error('请输入正确的用户名'));
        } else {
          callback();
        }
      };
      const validatePassword = (rule, value, callback) => {
        if (value.length < 6) {
          callback(new Error('请输入正确的密码'));
        } else {
          callback();
        }
      };
      const validateAuthCode = (rule, value, callback) => {
        if (value.length == 0) {
          callback(new Error('请输入正确的验证码'));
        } else {
          callback();
        }
      };
      // const validateCode = (rule, value, callback) => {
      //   if (value.length < 4) {
      //     callback(new Error('请输入正确的验证码'));
      //   } else {
      //     callback();
      //   }
      // };
      return {
        loginForm: {
          username: '',
          password: '',
          captchaValue: '',
          captchaId: '',
          authCode: ''
        },
        loginRules: {
          username: [{ required: true, trigger: 'change', validator: validateUsername }],
          password: [{ required: true, trigger: 'change', validator: validatePassword }],
          authCode: [{ required: true, trigger: 'change', validator: validateAuthCode }]
          // captchaValue: [{ required: true, trigger: 'blur', validator: validateCode }]
        },
        loading: false,
        passwordType: 'password',
        redirect: undefined,

        codeImg: '',
        picValid: false
      };
    },
    computed: {
      needSMS(){
        return this.$store.getters.needSMS
      }
    },
    watch: {
      $route: {
        handler: function(route) {
          this.redirect = route.query && route.query.redirect;
        },
        immediate: true
      }
    },
    created() {
      // this.getCode();
      this.$store.dispatch('user/getSMSTarget')
    },
    methods: {
      showPwd() {
        if (this.passwordType === 'password') {
          this.passwordType = '';
        } else {
          this.passwordType = 'password';
        }
        this.$nextTick(() => {
          this.$refs.password.focus();
        });
      },
      handleLogin() {
        this.$refs.loginForm.validate(valid => {
          if (valid) {
            this.picValidShow(); // 验证图片
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      },
      doConfirm(msg){
        return new Promise(resolve => {
          this.$alert(msg,{ showClose: false }).finally(() => {
            resolve();
          });
        })
      },
      doLogin() {
        // 验证完毕 去登录
        this.loading = true;
        this.$store.dispatch('user/login', this.loginForm)
          .then(async({ code, message }) => {
            console.log(code,111111)
            // if (code == '302') { // 有code代表第一次登陆，需要让他修改密码 911，接口负责人：zhanyi
            //   removeToken();// 清除localstorge，以免刷新可以直接进来
            //   this.$router.push({ path: 'password', query: { isInit: 1 }})
            // } else {
            //   if (code == '202') {
            //     await this.doConfirm(message);
            //   }
            //   this.$store.dispatch('user/getAccountResource').then(() => {
            //     this.$router.push({ path: '/welcome' });
            //     this.loading = false;
            //   }).catch(() => {
            //     this.$router.push({ path: '/welcome' });
            //     this.loading = false;
            //   });
            // }
            this.$router.push({ path: '/' });
          })
          .catch(_ => {
            //测试 TODO
             console.log('111111',111111)
             setToken('1111111')
              this.$router.push({ path: '/' });


            // this.loading = false;
            // this.$refs.picValidator.onRefresh();
            
            // this.getCode();
          });
      },
      // getCode() {
      //   var me = this;
      //   var xhr = new XMLHttpRequest();
      //   xhr.open('GET', '/api/common/imageCaptcha/get', true);
      //   xhr.responseType = 'blob';
      //   xhr.onreadystatechange = function() {
      //     if (xhr.readyState === 4 && xhr.status == 200) {
      //       me.loginForm.captchaId = xhr.getResponseHeader('captchaId');
      //       me.codeImg = window.URL.createObjectURL(this.response);
      //     }
      //   };
      //   xhr.send();
      // },
      picValidClose() {
        // 关闭图片验证
        this.picValid = false;
      },
      picValidShow() {
        // 打开图片验证
        this.picValid = true;
      },
      picValidSuccess() {
        // 图片验证成功回调
        this.picValidClose();
        this.doLogin();
      }
    }
  };
  console.log(process.env);
</script>

<style lang="scss">
  /* 修复input 背景不协调 和光标变色 */
  /* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

  $bg: #283443;
  $light_gray: #fff;
  $cursor: #fff;

  @supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
    .login-container .el-input input {
      color: $cursor;
    }
  }

  /* reset element-ui css */
  .login-container {
    .el-input {
      /*display: inline-block;*/
      height: 47px;
      /*width: 85%;*/

      input {
        background: transparent;
        border: 0px;
        -webkit-appearance: none;
        border-radius: 0px;
        padding: 12px 5px 12px 15px;
        color: $light_gray;
        height: 47px;
        caret-color: $cursor;

        &:-webkit-autofill {
          /*box-shadow: 0 0 0px 1000px $bg inset !important;*/
          -webkit-text-fill-color: $cursor !important;
        }
      }
      input:-internal-autofill-previewed,
      input:-internal-autofill-selected {
        -webkit-text-fill-color: #FFFFFF !important;
        transition: background-color 50000s ease-in-out 50000000s !important;
      }
    }

    .el-form-item {
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(0, 0, 0, 0.1);
      border-radius: 5px;
      color: #454545;
    }
    .el-input-group__append{
      background-color:transparent;
      border-color:transparent;
      border-left:1px solid #dcdfe636;
    }
    .el-button.is-loading:before{
      background-color:transparent!important;
    }
  }
</style>

<style lang="scss" scoped>
  $bg: #2d3a4b;
  $dark_gray: #909399;
  $light_gray: #eee;

  .login-container {
    min-height: 100%;
    width: 100%;
    background-color: $bg;
    overflow: hidden;
    color: #fff;
    background: url(../../assets/web-bg.png);
    background-position: center center;
    background-size: cover;

    .title-container {
      position: relative;
      font-size: 24px;
      padding-bottom: 48px;

      .name {
        font-size: 34px;
        margin: 34px 0 20px;
      }

      .logo {
        position: absolute;
        top: -125px;
        right: 0;
        width: 100px;
      }
    }

    .login-form {
      position: relative;
      // width: 520px;
      max-width: 100%;
      padding: 125px 35px 0;
      margin: 0 auto;
      overflow: hidden;
    }

    .login-cont {
      .login-tips {
        padding: 10px 0 32px;
        position: relative;

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          width: 86px;
          border-top: 2px solid #1c69d4;
        }
      }

      .form-cont {
        width: 428px;
        padding: 40px 40px 35px 40px;
        background: rgba(255, 255, 255, 0.1);
      }
    }

    .tips {
      font-size: 14px;
      color: #fff;
      margin-bottom: 10px;

      span {
        &:first-of-type {
          margin-right: 16px;
        }
      }
    }

    .svg-container {
      padding: 6px 5px 6px 15px;
      color: $dark_gray;
      vertical-align: middle;
      width: 30px;
      display: inline-block;
      display: none;
    }

    .title-container {
      position: relative;

      .title {
        font-size: 26px;
        color: $light_gray;
        margin: 0px auto 40px auto;
        text-align: center;
        font-weight: bold;
      }
    }

    .show-pwd {
      /*position: absolute;*/
      /*right: 16px;*/
      /*top: 4px;*/
      font-size: 16px;
      color: $dark_gray;
      cursor: pointer;
      user-select: none;
      width:20px;
      display:inline-block;
      text-align:center;
    }
  }

  .show-code {
    position: absolute;
    right: 6px;
    top: 6px;
    font-size: 16px;
    cursor: pointer;
    user-select: none;
    width: 60px;
    height: 36px;

    img {
      width: 100%;
      height: 100%;
    }
  }
  @media screen and (max-width: 1280px) {
    .login-container {
      .title-container{
        font-size:16px;
        .name{
          font-size: 26px;
          margin: 20px 0 14px;
        }
      }
      .login-form {
        padding: 70px 30px 0;
      }
    }
  }
  @media screen and (max-width: 768px) {
    .login-container {
      background: url(../../assets/mobie-bg.png);
      background-position: center center;
      background-size: cover;

      .title-container {
        font-size: 18px;
        padding-top: 40px;

        .name {
          font-size: 24px;
          margin: 20px 0 10px;
        }
      }

      .login-form {
        padding: 125px 30px 0;
        height: 100vh;

        .login-cont {
          position: absolute;
          left: 0;
          bottom: 0;
          width: 100%;

          .login-tips {
            padding: 30px 15px 0;
            background: rgba(255, 255, 255, 0.1);

            &::before {
              top: 14px;
              left: 15px;
            }
          }

          .form-cont {
            padding: 20px 15px 44px;
          }
        }

        .form-cont {
          width: 100%;
        }
      }
    }
  }
</style>
