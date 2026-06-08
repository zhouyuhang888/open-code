const API = require('../../api/index')
const { showToast, showModal } = require('../../utils/util')

Page({
  data: {
    orderList: [],
    activeTab: 'all',
    page: 1,
    loading: false,
    hasMore: true,
    statusMap: {
      'pending_payment': '待付款',
      'pending_ship': '待发货',
      'shipped': '待收货',
      'completed': '已完成',
      'cancelled': '已取消'
    }
  },

  onLoad(options) {
    if (options.status) {
      this.setData({ activeTab: options.status })
    }
    this.loadOrders()
  },

  onShow() {
    if (this.data.orderList.length > 0) {
      this.setData({ orderList: [], page: 1 })
      this.loadOrders()
    }
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ activeTab: tab, orderList: [], page: 1, hasMore: true })
    this.loadOrders()
  },

  async loadOrders() {
    if (this.data.loading) return
    this.setData({ loading: true })

    const res = await API.getOrders({
      status: this.data.activeTab,
      page: this.data.page,
      pageSize: 10
    })

    this.setData({
      orderList: [...this.data.orderList, ...res.list],
      loading: false,
      hasMore: this.data.page * 10 < res.total
    })
  },

  onReachBottom() {
    if (this.data.hasMore) {
      this.setData({ page: this.data.page + 1 })
      this.loadOrders()
    }
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/order-detail/order-detail?id=${id}` })
  },

  async cancelOrder(e) {
    const id = e.currentTarget.dataset.id
    const confirm = await showModal('提示', '确定取消该订单？')
    if (confirm) {
      await API.cancelOrder(id)
      showToast('已取消', 'success')
      this.setData({ orderList: [], page: 1 })
      this.loadOrders()
    }
  },

  async payOrder(e) {
    showToast('支付功能需对接微信支付')
  },

  async confirmReceive(e) {
    const id = e.currentTarget.dataset.id
    const confirm = await showModal('提示', '确认收到商品？')
    if (confirm) {
      await API.confirmReceive(id)
      showToast('确认成功', 'success')
      this.setData({ orderList: [], page: 1 })
      this.loadOrders()
    }
  },

  goHome() {
    wx.switchTab({ url: '/pages/index/index' })
  }
})
