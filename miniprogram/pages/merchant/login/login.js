const API = require('../../../api/index')
const { showToast, showLoading, hideLoading } = require('../../../utils/util')

Page({
  data: {
    account: '',
    password: ''
  },

  onInput(e) {
    this.setData({ [e.currentTarget.dataset.field]: e.detail.value })
  },

  async doLogin() {
    const { account, password } = this.data
    if (!account || !password) {
      showToast('请输入账号和密码')
      return
    }
    showLoading('登录中...')
    try {
      const res = await API.merchantLogin({ account, password })
      hideLoading()
      if (res.result && res.result.success) {
        wx.setStorageSync('merchantInfo', res.result.merchant)
        wx.redirectTo({ url: '/pages/merchant/goods-list/goods-list' })
      } else {
        showToast(res.result?.message || '登录失败')
      }
    } catch (err) {
      hideLoading()
      showToast('登录失败')
    }
  }
})
