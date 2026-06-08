const API = require('../../api/index')
const { showToast, showLoading, hideLoading, showModal } = require('../../utils/util')

Page({
  data: {
    address: null,
    orderItems: [],
    totalAmount: 0,
    freight: 0,
    remark: '',
    orderType: 'confirm'
  },

  onLoad(options) {
    const pendingOrder = wx.getStorageSync('pendingOrder') || { items: [], totalAmount: 0 }
    this.setData({
      orderItems: pendingOrder.items || [],
      totalAmount: pendingOrder.totalAmount || 0,
      orderType: options.type || 'confirm'
    })
    this.loadDefaultAddress()
  },

  async loadDefaultAddress() {
    const res = await API.getAddresses()
    if (res.data && res.data.length > 0) {
      this.setData({ address: res.data[0] })
    }
  },

  chooseAddress() {
    wx.navigateTo({ url: '/pages/address/address?select=true' })
  },

  onRemarkInput(e) {
    this.setData({ remark: e.detail.value })
  },

  async submitOrder() {
    if (!this.data.address) {
      showToast('请选择收货地址')
      return
    }

    showLoading('提交中...')
    try {
      const { orderItems, address, remark, totalAmount, freight } = this.data
      const res = await API.createOrder({
        items: orderItems,
        address,
        remark,
        totalAmount: totalAmount + freight,
        freight
      })

      hideLoading()

      const result = res.result || {}

      // 发起微信支付
      if (result.payment) {
        const payRes = await wx.requestPayment({
          timeStamp: result.payment.timeStamp,
          nonceStr: result.payment.nonceStr,
          package: result.payment.package,
          signType: 'MD5',
          paySign: result.payment.paySign
        })

        if (payRes.errMsg === 'requestPayment:ok') {
          // 清空购物车中已购买的商品
          const cartIds = orderItems.filter(i => i.cartId).map(i => i.cartId)
          for (const id of cartIds) {
            await API.removeCartItem(id)
          }
          wx.removeStorageSync('pendingOrder')
          wx.redirectTo({ url: `/pages/order-detail/order-detail?id=${result.orderId}` })
        }
      } else {
        wx.removeStorageSync('pendingOrder')
        wx.redirectTo({ url: `/pages/order-detail/order-detail?id=${result.orderId}` })
      }
    } catch (err) {
      hideLoading()
      showToast('提交失败，请重试')
      console.error('submitOrder error', err)
    }
  }
})
