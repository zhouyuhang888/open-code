const API = require('../../api/index')

Page({
  data: {
    categories: [],
    goodsList: [],
    activeIndex: 0,
    currentCategory: {},
    page: 1,
    loading: false,
    hasMore: true
  },

  onLoad() {
    this.loadCategories()
  },

  async loadCategories() {
    const res = await API.getCategories()
    const categories = res.data || []
    this.setData({
      categories,
      currentCategory: categories[0] || {}
    })
    if (categories.length > 0) {
      this.loadGoods()
    }
  },

  async loadGoods() {
    if (this.data.loading) return
    this.setData({ loading: true })

    const categoryId = this.data.currentCategory._id
    const res = await API.getGoods({
      categoryId,
      page: this.data.page,
      pageSize: 10
    })

    this.setData({
      goodsList: this.data.page === 1 ? res.list : [...this.data.goodsList, ...res.list],
      loading: false,
      hasMore: this.data.page * 10 < res.total
    })
  },

  switchCategory(e) {
    const index = e.currentTarget.dataset.index
    const category = this.data.categories[index]
    this.setData({
      activeIndex: index,
      currentCategory: category,
      goodsList: [],
      page: 1,
      hasMore: true
    })
    this.loadGoods()
  },

  onReachBottom() {
    if (this.data.hasMore) {
      this.setData({ page: this.data.page + 1 })
      this.loadGoods()
    }
  },

  goGoodsDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/goods/goods?id=${id}` })
  },

  goSearch() {
    wx.navigateTo({ url: '/pages/search/search' })
  }
})
