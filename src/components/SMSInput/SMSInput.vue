<template>
  <el-input
    class="smsInput"
    :placeholder="inputDefaultPlaceholderText || '短信验证码'"
    type="text"
    maxlength="10"
    :value="smsCode"
    @input="inputEvent"
  >
    <el-button
      slot="append"
      :loading="btnLoading"
      :class="{ disabled:this.time !== 60 }"
      @click="handleSend"
    >{{ btnText }}</el-button>
  </el-input>
</template>

<script>
import user from '@/apiMap/user';
const api = user.getVerificationCode;
export default {
  props: ['id', 'smsCode', 'btnDefaultText', 'inputDefaultPlaceholderText'],
  data(){
    return {
      time: 60,
      timer: null,
      btnLoading: false
    }
  },
  computed: {
    btnText(){
      return this.time == 60 ? (this.btnDefaultText || '发送') : this.time
    }
  },
  methods: {
    inputEvent(val){
      this.$emit('update:smsCode', val)
    },
    handleSend(){
      if (this.id) {
        this.send();
      } else {
        this.$message({ message: "请输入正确的用户名", type: 'warning' })
      }
    },
    send(){
      if (this.time == 60 && !this.btnLoading) {
        this.btnLoading = true;
        this.sendAjax().then(({ success }) => {
          if (success) {
            this.btnLoading = false;
            --this.time;
            this.timer = setInterval(() => {
              if (--this.time == 0) {
                clearInterval(this.timer);
                this.time = 60;
                this.btnLoading = false;
              }
            }, 1000)
          } else {
            this.btnLoading = false;
          }
        }).catch(() => {
          this.btnLoading = false;
        })
      }
    },
    sendAjax(){
      const params = { account: this.id };
      api.setParams(params);
      return this.httpClient(api, false)
    }
  }
};
</script>

<style scoped lang="scss">
.disabled{
  cursor:not-allowed;
}
</style>
<style lang="scss">
  .smsInput{
    .el-button{
      width:60px!important;
      padding-left:0;
      padding-right:0;
    }
  }
</style>
