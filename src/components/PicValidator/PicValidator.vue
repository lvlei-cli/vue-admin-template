<template>
  <div class="validBox">
    <div class="validBox__title" @click="onShow">点击进行图片验证</div>
    <div v-show="picValid" class="validBox__content">
      <div class="funcBox">
        <div class="funcBox__top">
          <div class="imgBox" :style="{ 'background-image': `url(${res.target})` }">
            <i
              :style="{
                'background-image': `url(${res.template})`,
                '-webkit-transform': `translate3d(${cx}px, 0, 0)`
              }"
            ></i>
          </div>
          <div class="slideBar">
            <span>拖动左边滑块完成上方拼图</span>
            <i
              :style="{ '-webkit-transform': `translate3d(${deltaX}px, 0, 0)` }"
              @mousedown="start"
            ></i>
          </div>
        </div>
        <div class="funcBox__bom">
          <i class="icon-close" @click="onClose"></i>
          <i class="icon-refresh" @click="onRefresh"></i>
        </div>
      </div>

      <!-- v-loading初始化出不来 -->
      <transition name="el-fade-in-linear">
        <div v-show="picLoading" class="el-loading-mask">
          <div class="el-loading-spinner">
            <svg viewBox="25 25 50 50" class="circular">
              <circle cx="50" cy="50" r="20" fill="none" class="path"></circle>
            </svg>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
  import user from '@/apiMap/user'
  const { slideCaptchaValidate } = user;
  export default {
    components: {},
    filters: {},
    props: ['picValid', 'onClose', 'onShow', 'onSuccess'],
    data() {
      return {
        res: {
          target: '', // 大图
          template: '' // 小图
        },
        captchaId: '',
        picLoading: false,
        deltaX: 0 // 底部slider偏移px
      };
    },
    computed: {
      cx() {
        // template 小图偏移px
        return (this.deltaX * 240) / 254;
      }
    },
    watch: {},
    beforeCreate() {},
    created() {},
    mounted() {
      this.getData();
    },
    methods: {
      onRefresh() {
        console.log(`refreshed`);
        this.clear();
        this.getData();
      },
      start(e) {
        // 开始事件
        const downCoordinate = { x: e.x, y: e.y };
        let x = 0;
        const move = ev => {
          // console.log(ev);
          x = ev.x - downCoordinate.x;
          if (x >= 255 || x <= 0) return false;
          this.deltaX = x;
          // console.log(x);
        };
        const up = () => {
          document.removeEventListener('mousemove', move);
          document.removeEventListener('mouseup', up);
          // 判断结果
          this.checkResult();
        };
        document.addEventListener('mousemove', move);
        document.addEventListener('mouseup', up);
      },
      checkResult() {
        // 计算偏移量
        const captchaValue = Math.ceil((this.cx / 240) * 100) + ''; // 计算1-100整数后转为字符串
        const captchaId = this.captchaId;
        slideCaptchaValidate.setParams({
          captchaId,
          captchaValue
        })
        this.httpClient(slideCaptchaValidate).then(res => {
          console.log(res);
          this.clear();
          if (res.data) {
            this.$emit('update:captchaId', captchaId);
            this.$emit('update:captchaValue', captchaValue);
            this.onSuccess();
          } else {
            this.$message({ message: '验证失败', type: 'error' })
            this.onRefresh();
          }
        })
      },
      clear() {
        this.deltaX = 0;
      },
      getData() {
        this.picLoading = true;
        var me = this;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/api/portal/slideCaptcha/get', true);
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4 && xhr.status == 200) {
            const captchaId = xhr.getResponseHeader('captchaid');
            me.captchaId = captchaId;
            const res = JSON.parse(this.response);
            me.res.target = 'data:image/png;base64,' + res.data.target;
            me.res.template = 'data:image/png;base64,' + res.data.template;
          }
          me.picLoading = false;
        };
        xhr.send();
      }
    }
  };
</script>
<style lang="scss" scoped>
  .validBox {
    position: relative;
    width: 100%;
    // height: 46px;
    height: 0;

    &__title {
      display: none;
      padding: 12px 5px 12px 15px;
      height: 47px;
      line-height: 20px;
      color: rgba(255, 255, 255, 0.8);
      cursor: pointer;
    }
    &__content {
      position: absolute;
      right: 0;
      bottom: 20px;
      width: 346px;
      background: #fff;
    }
    .funcBox {
      margin: 0 auto;
      width: 300px;

      &__top {
        padding-top: 20px;
        .imgBox {
          position: relative;
          width: 300px;
          height: 150px;
          overflow: hidden;
          background: left/100% 100% no-repeat #000;
          // background: rgba(153, 153, 153, 1);
          > i {
            position: absolute;
            left: 0;
            top: 50px;
            width: 60px;
            height: 60px;
            background: left/100% 100% no-repeat;
          }
        }
        .slideBar {
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          margin: 15px 0;
          width: 100%;
          height: 36px;
          color: rgba(153, 153, 153, 1);
          background: rgba(219, 220, 221, 1);
          border-radius: 18px;
          > span {
            user-select: none;
            pointer-events: none;
          }
          > i {
            position: absolute;
            left: -5px;
            top: 50%;
            margin-top: -27px;
            width: 55px;
            height: 55px;
            cursor: pointer;
            background: center/100% 100% no-repeat;
            background-image: url(data:image/png;base64,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);
          }
        }
      }
      &__bom {
        display: flex;
        align-items: center;
        height: 40px;
        border-top: 1px solid #eee;

        > i {
          display: inline-block;
          margin-right: 10px;
          width: 20px;
          height: 20px;
          background: center/100% no-repeat;
          cursor: pointer;
          &.icon-close {
            background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAApCAMAAABwfJv6AAAAe1BMVEUAAABmZmZmZmZmZmZnZ2dwcHBmZmZmZmZmZmZmZmZpaWlnZ2dmZmZnZ2dmZmZnZ2dnZ2doaGhra2tmZmZmZmZnZ2dmZmZnZ2dqampxcXFnZ2dnZ2dnZ2dnZ2dpaWlmZmZmZmZmZmZnZ2dpaWlpaWlnZ2dmZmZnZ2dmZmaPrMwRAAAAKHRSTlMA+vDZpQb16sFqGc7Hg3lxSz0R0uOviXYfC5dkWEYqt52NXjglurkx3GwTkAAAAe1JREFUOMudVdlygzAQw05wuEIo5kyhOdv6/7+wq2DiA3ipZkptVd6VZnemwT/xlddZxViV1fnXtippdsrCrklWZWUjlAfRlEvdcFAAi67HOD5eI/a6HgZf17z4y718N7hfXlTjyPoaXPbhPv7IwNa9RUHHPpd+PhmU5n6Em8dawgecH985oOuCVXRQDtognZllzzPKqEr/bmz8LX3OzRNBeScuDEP88i6UXSS6oG5ME0x77SelGermKDn99XvOSMX303FPZR6a/n69edoO73RpcWjpcLddPkExsyU3uhVBUFDUm9kqhud7RDH4UYo/n1ypH4vM4CjCx6DckSH8lIZDsQhZGmfHuSJwZ78bpCH+FNgoICwc6kQvl8IBwmEp3CGfhV8Bofi1uRtae2GSiqZDU6kSLww+qTXgCBuH3YqssadUDP2VeX3Gxk27dTZdFHJ09I1nKp4vsc/SXksYAEwhUxpADKnXbNRrJkQUzmaFkNNx1GtWcsTZBqLwEoccXrd1SJtPy1yRn3FLN5LvqtfTZe4W+DvC3pNHcz6u1uNo7MxIsdOKP6bcCYdQKlm4skIq6EKHbBnILO5mooszMKz1uxSUHZD1Oc/PtZxulWli2rdceeAt2i5R5qktS/My2EQSXy/ycJCXa+z9S/gD3xVEP+tvNZ8AAAAASUVORK5CYII=);
          }
          &.icon-refresh {
            background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAMAAAC7IEhfAAAAeFBMVEUAAABmZmZnZ2dnZ2doaGhmZmZmZmZmZmZmZmZnZ2dnZ2dnZ2d5eXlmZmZnZ2dmZmZnZ2dnZ2dmZmZnZ2dnZ2doaGhra2toaGhra2tnZ2dnZ2dnZ2dnZ2dnZ2dmZmZnZ2dnZ2dnZ2dmZmZoaGhoaGhpaWlnZ2dmZmb61mojAAAAJ3RSTlMA+75wM/fet/GxZV4J6ubY0K2kkFYjHhYPxc11aSiY1Z+ViUI5K5rbiz9XAAABcUlEQVQ4y6WU2ZKDIBBFwQURd6MxGrMnc///D8fGJBUXMlTNecHGU91UUzSbsquOQZdyKZxL1DATsXI4PmijeNWLBOak1VLzThhJ8qAM8uQZBdt5Op+2uePWz43aHc8h1cTbgCgOk81HCMKl7+cZrrSReWzOXYxm40DHisJwx5bsAvq1ScEpunEK2Do/ILQYZ5SPmSjeojuseWzyPPESGzmsnsnrfWh8xvbDUhrzSbzFDuDUfpPqFokWawAO+85Bla2u3DMLzoO4tREdqm+DADIrUU5u5Z+EQGIlZoCwEn1qtQVbAGcbsR/EPWtLdfi71aipPpLC9b5U5kDHSNRIo1rqyoyPnt+bPI+yNC9RGPPFuX6wL7H4divI4reIo8GjEcJv9AWkFCBYff+UD4pp0WmYS6G4Lzwvox/XMaDpM5oIH9OXUgCLEaKkYer50bz9weocPa20rUoxR0TrrY3aT4s7KmYmmujSCsnTLjhWs3b9AiAOOF8gUseNAAAAAElFTkSuQmCC);
          }
        }
      }
    }
  }
</style>
