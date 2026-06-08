const db = wx.cloud.database()
const _ = db.command
const $ = db.command.aggregate

const API = {
  // 用户登录
  async login(code) {
    return wx.cloud.callFunction({ name: 'login', data: { code } })
  },

  // 获取用户信息
  async getUserInfo() {
    return db.collection('users').where({
      _openid: '{openid}'
    }).get()
  },

  // 商品相关
  async getGoods(params = {}) {
    const { categoryId, page = 1, pageSize = 10, sort = 'default' } = params
    let query = db.collection('goods').where({ status: 'on' })

    if (categoryId) {
      query = query.where({ categoryId })
    }

    let orderBy = {}
    switch (sort) {
      case 'price_asc': orderBy = { price: 'asc' }; break
      case 'price_desc': orderBy = { price: 'desc' }; break
      case 'sales': orderBy = { sales: 'desc' }; break
      case 'new': orderBy = { createTime: 'desc' }; break
      default: orderBy = { createTime: 'desc' }
    }

    const sortKey = Object.keys(orderBy)[0]
    const sortDir = orderBy[sortKey]
    query = query.orderBy(sortKey, sortDir)

    const skip = (page - 1) * pageSize
    const countResult = await query.count()
    const total = countResult.total
    const res = await query.skip(skip).limit(pageSize).get()

    return { list: res.data, total, page, pageSize }
  },

  async getGoodsDetail(id) {
    return db.collection('goods').doc(id).get()
  },

  async getGoodsByIds(ids) {
    return db.collection('goods').where({
      _id: _.in(ids)
    }).get()
  },

  // 分类
  async getCategories() {
    return db.collection('categories').orderBy('sort', 'asc').get()
  },

  // 购物车
  async getCart() {
    return db.collection('cart').where({
      _openid: '{openid}'
    }).get()
  },

  async addToCart(goods) {
    const { goodsId, spec, quantity } = goods
    const exist = await db.collection('cart').where({
      _openid: '{openid}',
      goodsId,
      spec
    }).get()

    if (exist.data.length > 0) {
      return db.collection('cart').doc(exist.data[0]._id).update({
        data: { quantity: _.inc(quantity) }
      })
    }
    return db.collection('cart').add({
      data: {
        goodsId,
        spec,
        quantity,
        createTime: db.serverDate()
      }
    })
  },

  async updateCartQuantity(id, quantity) {
    if (quantity <= 0) {
      return db.collection('cart').doc(id).remove()
    }
    return db.collection('cart').doc(id).update({
      data: { quantity }
    })
  },

  async removeCartItem(id) {
    return db.collection('cart').doc(id).remove()
  },

  async clearCart() {
    const cart = await this.getCart()
    const ids = cart.data.map(item => item._id)
    if (ids.length === 0) return
    return db.collection('cart').where({
      _id: _.in(ids)
    }).remove()
  },

  // 订单
  async createOrder(orderData) {
    return wx.cloud.callFunction({
      name: 'createOrder',
      data: orderData
    })
  },

  async getOrders(params = {}) {
    const { status, page = 1, pageSize = 10 } = params
    let query = db.collection('orders').where({ _openid: '{openid}' })
    if (status && status !== 'all') {
      query = query.where({ status })
    }
    query = query.orderBy('createTime', 'desc')
    const skip = (page - 1) * pageSize
    const countResult = await query.count()
    const res = await query.skip(skip).limit(pageSize).get()
    return { list: res.data, total: countResult.total, page, pageSize }
  },

  async getOrderDetail(id) {
    return db.collection('orders').doc(id).get()
  },

  async cancelOrder(id) {
    return db.collection('orders').doc(id).update({
      data: { status: 'cancelled' }
    })
  },

  async confirmReceive(id) {
    return db.collection('orders').doc(id).update({
      data: { status: 'completed' }
    })
  },

  // 收货地址
  async getAddresses() {
    return db.collection('addresses').where({
      _openid: '{openid}'
    }).orderBy('isDefault', 'desc').orderBy('createTime', 'desc').get()
  },

  async addAddress(address) {
    if (address.isDefault) {
      await db.collection('addresses').where({
        _openid: '{openid}'
      }).update({ data: { isDefault: false } })
    }
    return db.collection('addresses').add({
      data: { ...address, createTime: db.serverDate() }
    })
  },

  async updateAddress(id, address) {
    if (address.isDefault) {
      await db.collection('addresses').where({
        _openid: '{openid}'
      }).update({ data: { isDefault: false } })
    }
    return db.collection('addresses').doc(id).update({ data: address })
  },

  async deleteAddress(id) {
    return db.collection('addresses').doc(id).remove()
  },

  // 商家端
  async merchantLogin(data) {
    return wx.cloud.callFunction({
      name: 'merchantLogin',
      data
    })
  },

  async addGoods(goods) {
    return wx.cloud.callFunction({
      name: 'merchantAddGoods',
      data: goods
    })
  },

  async updateGoods(id, goods) {
    return db.collection('goods').doc(id).update({ data: goods })
  },

  async getMerchantOrders(params = {}) {
    return wx.cloud.callFunction({
      name: 'getMerchantOrders',
      data: params
    })
  },

  async shipOrder(orderId, logistics) {
    return wx.cloud.callFunction({
      name: 'shipOrder',
      data: { orderId, ...logistics }
    })
  },

  async getMerchantStats() {
    return wx.cloud.callFunction({ name: 'getMerchantStats' })
  }
}

module.exports = API
