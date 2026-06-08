const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { goodsId, spec, quantity } = event
  const { OPENID } = cloud.getWXContext()

  const exist = await db.collection('cart').where({
    _openid: OPENID,
    goodsId,
    spec
  }).get()

  if (exist.data.length > 0) {
    await db.collection('cart').doc(exist.data[0]._id).update({
      data: { quantity: db.command.inc(quantity) }
    })
  } else {
    await db.collection('cart').add({
      data: {
        _openid: OPENID,
        goodsId,
        spec,
        quantity,
        createTime: db.serverDate()
      }
    })
  }

  return { success: true }
}
