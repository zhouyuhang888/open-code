const API = require('../../api/index')
const { showToast } = require('../../utils/util')

Page({
  data: {
    cartList: [],
    allChecked: false,
    totalAmount: 0,
    checkedCount: 0,
    hasChecked: false
  },

  onShow() {
    this.loadCart()
  },

  async loadCart() {
    const res = await API.getCart()
    const list = res.data || []
    const goodsIds = [...new Set(list.map(item => item.goodsId))]

    let goodsMap = {}
    if (goodsIds.length > 0) {
      const goodsRes = await API.getGoodsByIds(goodsIds)
      goodsRes.data.forEach(g => { goodsMap[g._id] = g })
    }

    const cartList = list.map(item => ({
      ...item,
      goodsInfo: goodsMap[item.goodsId] || null,
      checked: true
    }))

    this.setData({ cartList })
    this.calcTotal()
    getApp().globalData.cartCount = cartList.length
  },

  toggleCheck(e) {
    const id = e.currentTarget.dataset.id
    const cartList = this.data.cartList.map(item => {
      if (item._id === id) item.checked = !item.checked
      return item
    })
    this.setData({ cartList })
    this.calcTotal()
  },

  toggleAll() {
    const allChecked = !this.data.allChecked
    const cartList = this.data.cartList.map(item => ({ ...item, checked: allChecked }))
    this.setData({ cartList, allChecked })
    this.calcTotal()
  },

  calcTotal() {
    let total = 0
    let count = 0
    this.data.cartList.forEach(item => {
      if (item.checked) {
        const price = item.goodsInfo?.price || item.price || 0
        total += price * item.quantity
        count += item.quantity
      }
    })
    this.setData({
      totalAmount: total,
      checkedCount: count,
      hasChecked: count > 0,
      allChecked: this.data.cartList.every(i => i.checked)
    })
  },

  async decreaseQty(e) {
    const id = e.currentTarget.dataset.id
    const item = this.data.cartList.find(i => i._id === id)
    if (!item) return
    if (item.quantity <= 1) {
      await API.removeCartItem(id)
    } else {
      await API.updateCartQuantity(id, item.quantity - 1)
    }
    this.loadCart()
  },

  async increaseQty(e) {
    const id = e.currentTarget.dataset.id
    const item = this.data.cartList.find(i => i._id === id)
    if (!item) return
    await API.updateCartQuantity(id, item.quantity + 1)
    this.loadCart()
  },

  checkout() {
    const checkedItems = this.data.cartList.filter(i => i.checked)
    if (checkedItems.length === 0) {
      showToast('请选择商品')
      return
    }
    const items = checkedItems.map(item => ({
      cartId: item._id,
      goodsId: item.goodsId,
      name: item.goodsInfo?.name || '',
      image: item.goodsInfo?.images?.[0] || '',
      spec: item.spec || '默认',
      price: item.goodsInfo?.price || 0,
      quantity: item.quantity
    }))
    const total = items.reduce((s, i) => s + i.price * i.quantity, 0)
    wx.setStorageSync('pendingOrder', { items, totalAmount: total })
    wx.navigateTo({ url: '/pages/order/order?type=confirm' })
  },

  goHome() {
    wx.switchTab({ url: '/pages/index/index' })
  }
})
