const API = require('../../../api/index')
const { showToast } = require('../../../utils/util')

Page({
  data: {
    goodsList: [],
    activeTab: 'on'
  },

  onShow() {
    this.loadGoods()
  },

  async loadGoods() {
    const res = await API.getGoods({ page: 1, pageSize: 100 })
    const all = res.list || []
    const goodsList = all.filter(g => g.status === this.data.activeTab)
    this.setData({ goodsList })
  },

  switchTab(e) {
    this.setData({ activeTab: e.currentTarget.dataset.tab })
    this.loadGoods()
  },

  addGoods() {
    wx.navigateTo({ url: '/pages/merchant/goods-edit/goods-edit' })
  },

  editGoods(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/merchant/goods-edit/goods-edit?id=${id}` })
  },

  async toggleStatus(e) {
    const { id, status } = e.currentTarget.dataset
    const newStatus = status === 'on' ? 'off' : 'on'
    await API.updateGoods(id, { status: newStatus })
    showToast(newStatus === 'on' ? '已上架' : '已下架', 'success')
    this.loadGoods()
  },

  goOrders() {
    wx.redirectTo({ url: '/pages/merchant/orders/orders' })
  },

  goStats() {
    wx.redirectTo({ url: '/pages/merchant/stats/stats' })
  }
})
