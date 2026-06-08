App({
  globalData: {
    userInfo: null,
    hasLogin: false,
    openid: '',
    cartCount: 0
  },

  onLaunch() {
    wx.cloud.init({
      env: 'cloud1-d9gkhxg0k1c78555c',
      traceUser: true
    })
    this.loadCartCount()
  },

  setUserInfo(userInfo) {
    this.globalData.userInfo = userInfo
    this.globalData.hasLogin = true
  },

  loadCartCount() {
    const openid = this.globalData.openid
    if (!openid) return
    const db = wx.cloud.database()
    db.collection('cart').where({
      _openid: openid
    }).count().then(res => {
      this.globalData.cartCount = res.total
    })
  }
})
