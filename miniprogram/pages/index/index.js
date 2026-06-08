const API = require('../../api/index')

const DEFAULT_GOODS = [
  {
    _id: 'demo_001',
    name: '有机生态土鸡蛋 30枚装',
    price: 68,
    images: ['https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&h=400&fit=crop'],
    isOrganic: true,
    isLocal: true,
    sales: 156
  },
  {
    _id: 'demo_002',
    name: '高山有机大白菜 2.5kg',
    price: 29.9,
    images: ['https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&h=400&fit=crop'],
    isOrganic: true,
    isLocal: true,
    sales: 320
  },
  {
    _id: 'demo_003',
    name: '古法压榨菜籽油 2.5L',
    price: 89,
    images: ['https://images.unsplash.com/photo-1586201375761-eb8c9c2e9d9e?w=400&h=400&fit=crop'],
    isOrganic: false,
    isLocal: true,
    sales: 89
  },
  {
    _id: 'demo_004',
    name: '高山野生百花蜜 500g',
    price: 128,
    images: ['https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=400&fit=crop'],
    isOrganic: true,
    isLocal: true,
    sales: 210
  }
]

const DEFAULT_CATEGORIES = [
  { _id: 'cat_demo_1', name: '有机蔬菜', icon: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=80&h=80&fit=crop' },
  { _id: 'cat_demo_2', name: '时令水果', icon: 'https://images.unsplash.com/photo-1619566636858-adf3ef57257a?w=80&h=80&fit=crop' },
  { _id: 'cat_demo_3', name: '五谷粮油', icon: 'https://images.unsplash.com/photo-1586201375761-eb8c9c2e9d9e?w=80&h=80&fit=crop' },
  { _id: 'cat_demo_4', name: '禽蛋肉类', icon: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=80&h=80&fit=crop' },
  { _id: 'cat_demo_5', name: '菌菇干货', icon: 'https://images.unsplash.com/photo-1500593389740-3e07bbc3a15b?w=80&h=80&fit=crop' }
]

Page({
  data: {
    banners: [
      { image: 'https://images.unsplash.com/photo-1500593389740-3e07bbc3a15b?w=750&h=340&fit=crop', title: '有机蔬菜直送到家' },
      { image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=750&h=340&fit=crop', title: '产地直发·新鲜直达' },
      { image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=750&h=340&fit=crop', title: '农家散养土鸡蛋' }
    ],
    categories: [],
    recommendGoods: [],
    loading: false,
    hasMore: true,
    page: 1,
    usingDemoData: false
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
    const cats = res.data || []
    if (cats.length > 0) {
      this.setData({ categories: cats, usingDemoData: false })
    } else {
      this.setData({ categories: DEFAULT_CATEGORIES, usingDemoData: true })
    }
  },

  async loadGoods() {
    if (this.data.loading) return
    this.setData({ loading: true })
    const res = await API.getGoods({ page: this.data.page, pageSize: 10, sort: 'new' })
    const list = res.list || []
    if (list.length > 0) {
      this.setData({
        recommendGoods: this.data.page === 1 ? list : [...this.data.recommendGoods, ...list],
        loading: false,
        hasMore: this.data.page * 10 < res.total,
        usingDemoData: false
      })
    } else {
      this.setData({
        recommendGoods: DEFAULT_GOODS,
        loading: false,
        hasMore: false,
        usingDemoData: true
      })
    }
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.usingDemoData) {
      this.setData({ page: this.data.page + 1 })
      this.loadGoods()
    }
  },

  goCategory() {
    wx.switchTab({ url: '/pages/category/category' })
  },

  goGoodsDetail(e) {
    const id = e.currentTarget.dataset.id
    if (id && id.startsWith('demo_')) {
      return
    }
    wx.navigateTo({ url: `/pages/goods/goods?id=${id}` })
  },

  goSearch() {
    wx.navigateTo({ url: '/pages/search/search' })
  },

  onBannerTap(e) {
  },

  loadCartCount() {
    const app = getApp()
    if (app.globalData.cartCount > 0) {
      wx.setTabBarBadge({ index: 2, text: String(app.globalData.cartCount) })
    }
  }
})
