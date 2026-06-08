const API = require('../../api/index')

Page({
  data: {
    keyword: '',
    results: [],
    searched: false,
    loading: false,
    hasMore: true,
    page: 1,
    searchHistory: []
  },

  onLoad() {
    const history = wx.getStorageSync('searchHistory') || []
    this.setData({ searchHistory: history })
  },

  onInput(e) {
    this.setData({ keyword: e.detail.value })
  },

  doSearch() {
    if (!this.data.keyword.trim()) return
    this.saveHistory(this.data.keyword)
    this.setData({ results: [], page: 1, searched: true, hasMore: true })
    this.searchGoods()
  },

  async searchGoods() {
    if (this.data.loading) return
    this.setData({ loading: true })
    const res = await API.getGoods({ page: this.data.page, pageSize: 10 })
    const results = res.list.filter(g => g.name.includes(this.data.keyword) || (g.description || '').includes(this.data.keyword))
    this.setData({
      results: this.data.page === 1 ? results : [...this.data.results, ...results],
      loading: false,
      hasMore: this.data.page * 10 < res.total
    })
  },

  saveHistory(keyword) {
    let history = this.data.searchHistory
    history = history.filter(h => h !== keyword)
    history.unshift(keyword)
    if (history.length > 10) history = history.slice(0, 10)
    this.setData({ searchHistory: history })
    wx.setStorageSync('searchHistory', history)
  },

  searchByKeyword(e) {
    const keyword = e.currentTarget.dataset.keyword
    this.setData({ keyword })
    this.doSearch()
  },

  clearSearch() {
    this.setData({ keyword: '', results: [], searched: false })
  },

  clearHistory() {
    this.setData({ searchHistory: [] })
    wx.setStorageSync('searchHistory', [])
  },

  goGoodsDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/goods/goods?id=${id}` })
  },

  goBack() {
    wx.navigateBack()
  },

  onReachBottom() {
    if (this.data.hasMore && this.data.searched) {
      this.setData({ page: this.data.page + 1 })
      this.searchGoods()
    }
  }
})
