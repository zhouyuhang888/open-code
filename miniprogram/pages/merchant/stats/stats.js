const API = require('../../../api/index')

Page({
  data: {
    stats: {},
    recentOrders: [],
    statusMap: {
      'pending_payment': '待付款',
      'pending_ship': '待发货',
      'shipped': '待收货',
      'completed': '已完成',
      'cancelled': '已取消'
    }
  },

  onShow() {
    this.loadStats()
  },

  async loadStats() {
    try {
      const res = await API.getMerchantStats()
      const result = res.result || {}
      this.setData({
        stats: result.stats || {},
        recentOrders: result.recentOrders || []
      })
    } catch (err) {
      const ordersRes = await API.getOrders({ page: 1, pageSize: 5 })
      const goodsRes = await API.getGoods({ page: 1, pageSize: 1 })
      const list = ordersRes.list || []
      this.setData({
        stats: {
          totalOrders: ordersRes.total || 0,
          totalAmount: list.reduce((s, o) => s + (o.totalAmount || 0), 0),
          totalGoods: goodsRes.total || 0,
          totalSales: list.reduce((s, o) => s + (o.items || []).reduce((s2, i) => s2 + (i.quantity || 0), 0), 0)
        },
        recentOrders: list.slice(0, 5)
      })
    }
  },

  goGoodsList() { wx.redirectTo({ url: '/pages/merchant/goods-list/goods-list' }) },
  goOrders() { wx.redirectTo({ url: '/pages/merchant/orders/orders' }) }
})
