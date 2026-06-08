const API = require('../../api/index')

Page({
  data: {
    userInfo: {},
    orderCounts: {}
  },

  onShow() {
    const app = getApp()
    if (app.globalData.userInfo) {
      this.setData({ userInfo: app.globalData.userInfo })
    }
    this.loadOrderCounts()
  },

  doLogin() {
    const app = getApp()
    if (app.globalData.hasLogin) return
    wx.getUserProfile({
      desc: '用于展示用户信息',
      success: (res) => {
        wx.setStorageSync('userInfo', res.userInfo)
        app.setUserInfo(res.userInfo)
        this.setData({ userInfo: res.userInfo })

        wx.login({
          success: (loginRes) => {
            API.login(loginRes.code)
          }
        })
      },
      fail: () => {
        wx.showToast({ title: '登录失败', icon: 'none' })
      }
    })
  },

  async loadOrderCounts() {
    const res = await API.getOrders({ page: 1, pageSize: 1 })
    const total = res.total || 0
    this.setData({ 'orderCounts.all': total })
  },

  goOrderList(e) {
    const status = e.currentTarget.dataset.status
    wx.navigateTo({ url: `/pages/order-list/order-list?status=${status}` })
  },

  goAddress() {
    wx.navigateTo({ url: '/pages/address/address' })
  },

  goMerchant() {
    wx.navigateTo({ url: '/pages/merchant/login/login' })
  },

  contactService() {
    wx.showActionSheet({
      itemList: ['联系客服：13800138000'],
      success() {
        wx.makePhoneCall({ phoneNumber: '13800138000' })
      }
    })
  }
})
