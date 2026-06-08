const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const goods = { ...event }
  delete goods.$url

  goods.createTime = db.serverDate()
  goods.sales = 0
  goods.status = 'on'

  const res = await db.collection('goods').add({ data: goods })
  return { success: true, id: res._id }
}
