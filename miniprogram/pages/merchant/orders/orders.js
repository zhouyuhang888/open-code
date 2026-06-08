const API = require('../../../api/index')
const { showToast } = require('../../../utils/util')

Page({
  data: {
    orderList: [],
    activeTab: 'all',
    tabClass0: 'active',
    tabClass1: '',
    tabClass2: '',
    tabClass3: '',
    empty: false,
    statusMap: {
      'pending_payment': '待付款',
      'pending_ship': '待发货',
      'shipped': '待收货',
      'completed': '已完成',
      'cancelled': '已取消'
    }
  },

  onShow() {
    this.loadOrders()
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ activeTab: tab })
    this.updateTabClass(tab)
    this.loadOrders()
  },

  updateTabClass(tab) {
    this.setData({
      tabClass0: tab === 'all' ? 'active' : '',
      tabClass1: tab === 'pending_ship' ? 'active' : '',
      tabClass2: tab === 'shipped' ? 'active' : '',
      tabClass3: tab === 'completed' ? 'active' : ''
    })
  },

  async loadOrders() {
    const res = await API.getMerchantOrders({ status: this.data.activeTab })
    const rawList = res.result ? res.result.list : (res.data || [])
    const list = rawList.map(item => {
      const addr = item.address || {}
      const items = item.items || []
      return {
        id: item._id,
        orderNo: item.orderNo || item._id,
        status: item.status,
        statusText: this.data.statusMap[item.status] || item.status,
        totalAmount: item.totalAmount || 0,
        addressName: addr.name || '',
        addressPhone: addr.phone || '',
        addressDetail: (addr.province || '') + (addr.city || '') + (addr.district || '') + (addr.detail || ''),
        showShip: item.status === 'pending_ship',
        goodsDisplay: items.map(gi => ({
          giImage: gi.image || 'https://via.placeholder.com/120',
          giName: gi.name || '',
          giSpec: gi.spec || '',
          giQty: gi.quantity || 0
        }))
      }
    })
    this.setData({
      orderList: list,
      empty: list.length === 0
    })
  },

  showShipDialog(e) {
    const orderId = e.currentTarget.dataset.id
    wx.showModal({
      title: '发货',
      editable: true,
      placeholderText: '请输入物流单号',
      success: async (res) => {
        if (res.confirm && res.content) {
          await API.shipOrder(orderId, { logistics: res.content, shipTime: new Date().toISOString() })
          showToast('发货成功', 'success')
          this.loadOrders()
        }
      }
    })
  },

  goGoodsList() { wx.redirectTo({ url: '/pages/merchant/goods-list/goods-list' }) },
  goOrders() {},
  goStats() { wx.redirectTo({ url: '/pages/merchant/stats/stats' }) }
})
