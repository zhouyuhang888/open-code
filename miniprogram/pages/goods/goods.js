const API = require('../../api/index')
const { showToast } = require('../../utils/util')

Page({
  data: {
    goods: {},
    specList: [],
    selectedSpec: {},
    selectedPrice: 0,
    selectedStock: 0,
    quantity: 1,
    showSpecPanel: false,
    isFav: false
  },

  onLoad(options) {
    if (options.id) {
      this.loadGoods(options.id)
    }
  },

  async loadGoods(id) {
    const res = await API.getGoodsDetail(id)
    const goods = res.data || {}
    const specList = goods.specs || [
      { name: '规格', options: goods.specOptions || [{ value: '默认', price: goods.price, stock: goods.stock }] }
    ]

    const firstOpts = specList.map(g => g.options[0])
    firstOpts.forEach(o => { o.selected = true })

    this.setData({
      goods,
      specList,
      selectedPrice: goods.price,
      selectedStock: goods.stock || 99
    })
  },

  selectSpec(e) {
    const { group, opt } = e.currentTarget.dataset
    const specList = this.data.specList
    specList[group].options.forEach(o => { o.selected = false })
    opt.selected = true

    const selected = {}
    let price = this.data.goods.price
    let stock = this.data.goods.stock || 99
    specList.forEach(g => {
      const s = g.options.find(o => o.selected)
      if (s) {
        selected[g.name] = s.value
        if (s.price) price = s.price
        if (s.stock !== undefined) stock = s.stock
      }
    })

    this.setData({ specList, selectedSpec: selected, selectedPrice: price, selectedStock: stock })
  },

  toggleSpecPanel() {
    this.setData({ showSpecPanel: !this.data.showSpecPanel, quantity: 1 })
  },

  decreaseQty() {
    if (this.data.quantity > 1) {
      this.setData({ quantity: this.data.quantity - 1 })
    }
  },

  increaseQty() {
    if (this.data.quantity < this.data.selectedStock) {
      this.setData({ quantity: this.data.quantity + 1 })
    }
  },

  async confirmAddToCart() {
    const { goods, selectedSpec, quantity } = this.data
    const spec = Object.values(selectedSpec).join('/') || '默认'
    await API.addToCart({ goodsId: goods._id, spec, quantity })
    this.setData({ showSpecPanel: false })
    showToast('已加入购物车', 'success')
    getApp().loadCartCount()
  },

  async buyNow() {
    const { goods, selectedSpec, quantity, selectedPrice } = this.data
    const spec = Object.values(selectedSpec).join('/') || '默认'
    const orderData = {
      items: [{
        goodsId: goods._id,
        name: goods.name,
        image: goods.images?.[0] || '',
        spec,
        price: selectedPrice,
        quantity
      }],
      totalAmount: selectedPrice * quantity
    }
    wx.setStorageSync('pendingOrder', orderData)
    wx.navigateTo({ url: '/pages/order/order?type=confirm' })
  },

  addFav() {
    this.setData({ isFav: !this.data.isFav })
    showToast(this.data.isFav ? '已收藏' : '已取消收藏', 'success')
  },

  goCart() {
    wx.switchTab({ url: '/pages/cart/cart' })
  }
})
