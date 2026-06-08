const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const { status, page = 1, pageSize = 10 } = event

  let query = db.collection('orders').where({ _openid: OPENID })
  if (status && status !== 'all') {
    query = query.where({ status })
  }
  query = query.orderBy('createTime', 'desc')

  const countResult = await query.count()
  const total = countResult.total
  const skip = (page - 1) * pageSize
  const res = await query.skip(skip).limit(pageSize).get()

  return { list: res.data, total }
}
