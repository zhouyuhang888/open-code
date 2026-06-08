const API = require('../../api/index')
const { showToast, showModal } = require('../../utils/util')

Page({
  data: {
    order: {},
    statusMap: {
      'pending_payment': '待付款',
      'pending_ship': '待发货',
      'shipped': '待收货',
      'completed': '已完成',
      'cancelled': '已取消'
    },
    statusIconMap: {
      'pending_payment': '⏳',
      'pending_ship': '📦',
      'shipped': '🚚',
      'completed': '✅',
      'cancelled': '❌'
    },
    statusDescMap: {
      'pending_payment': '请尽快完成支付',
      'pending_ship': '商家正在准备发货',
      'shipped': '商品已在路上',
      'completed': '交易已完成',
      'cancelled': '订单已取消'
    }
  },

  onLoad(options) {
    if (options.id) {
      this.loadOrder(options.id)
    }
  },

  async loadOrder(id) {
    const res = await API.getOrderDetail(id)
    const order = res.data || {}
    this.setData({
      order,
      statusText: this.data.statusMap[order.status] || '未知',
      statusIcon: this.data.statusIconMap[order.status] || '',
      statusDesc: this.data.statusDescMap[order.status] || ''
    })
  },

  async payOrder() {
    showToast('支付功能需对接微信支付')
  },

  async cancelOrder() {
    const confirm = await showModal('提示', '确定取消该订单？')
    if (confirm) {
      await API.cancelOrder(this.data.order._id)
      showToast('已取消', 'success')
      this.loadOrder(this.data.order._id)
    }
  },

  async confirmReceive() {
    const confirm = await showModal('提示', '确认收到商品？')
    if (confirm) {
      await API.confirmReceive(this.data.order._id)
      showToast('确认成功', 'success')
      this.loadOrder(this.data.order._id)
    }
  },

  goHome() {
    wx.switchTab({ url: '/pages/index/index' })
  }
})
