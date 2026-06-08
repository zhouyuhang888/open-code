const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async () => {
  const ordersRes = await db.collection('orders').get()
  const goodsRes = await db.collection('goods').get()
  const orders = ordersRes.data || []
  const goodsList = goodsRes.data || []

  const totalOrders = orders.length
  const totalAmount = orders.reduce((s, o) => s + (o.totalAmount || 0), 0)
  const totalGoods = goodsList.length
  const totalSales = goodsList.reduce((s, g) => s + (g.sales || 0), 0)
  const recentOrders = orders.sort((a, b) => {
    return (b.createTime || '').localeCompare(a.createTime || '')
  }).slice(0, 5)

  return {
    stats: { totalOrders, totalAmount, totalGoods, totalSales },
    recentOrders
  }
}
