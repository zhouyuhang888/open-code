const API = require('../../api/index')

Page({
  data: {
    banners: [
      { image: 'https://via.placeholder.com/750x340/5B8C2A/ffffff?text=有机蔬菜直送到家' },
      { image: 'https://via.placeholder.com/750x340/D4A843/ffffff?text=产地直发·新鲜直达' },
      { image: 'https://via.placeholder.com/750x340/7CB342/ffffff?text=农家散养土鸡蛋' }
    ],
    categories: [],
    recommendGoods: [],
    loading: false,
    hasMore: true,
    page: 1
  },

  onLoad() {
    this.loadCategories()
    this.loadGoods()
  },

  onShow() {
    this.loadCartCount()
  },

  async loadCategories() {
    const res = await API.getCategories()
    this.setData({ categories: res.data || [] })
  },

  async loadGoods() {
    if (this.data.loading) return
    this.setData({ loading: true })
    const res = await API.getGoods({ page: this.data.page, pageSize: 10, sort: 'new' })
    this.setData({
      recommendGoods: [...this.data.recommendGoods, ...res.list],
      loading: false,
      hasMore: this.data.recommendGoods.length + res.list.length < res.total
    })
  },

  onReachBottom() {
    if (this.data.hasMore) {
      this.setData({ page: this.data.page + 1 })
      this.loadGoods()
    }
  },

  goCategory(e) {
    const id = e.currentTarget.dataset.id
    wx.switchTab({ url: '/pages/category/category' })
  },

  goGoodsDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/goods/goods?id=${id}` })
  },

  goSearch() {
    wx.navigateTo({ url: '/pages/search/search' })
  },

  onBannerTap(e) {
    console.log('banner tap', e.currentTarget.dataset.item)
  },

  loadCartCount() {
    const app = getApp()
    if (app.globalData.cartCount > 0) {
      wx.setTabBarBadge({ index: 2, text: String(app.globalData.cartCount) })
    }
  }
})
