const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const { items, address, remark, totalAmount, freight } = event

  const orderNo = 'ORD' + Date.now() + Math.random().toString(36).slice(2, 6).toUpperCase()

  const orderData = {
    _openid: OPENID,
    orderNo,
    items: items || [],
    address: address || {},
    remark: remark || '',
    totalAmount: totalAmount || 0,
    freight: freight || 0,
    status: 'pending_payment',
    createTime: db.serverDate(),
    payTime: null,
    shipTime: null,
    logistics: ''
  }

  const res = await db.collection('orders').add({ data: orderData })

  // 减少库存
  for (const item of items) {
    await db.collection('goods').doc(item.goodsId).update({
      data: {
        stock: db.command.inc(-item.quantity),
        sales: db.command.inc(item.quantity)
      }
    })
  }

  return {
    success: true,
    orderId: res._id,
    orderNo
  }
}
