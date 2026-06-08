const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { status } = event
  let query = db.collection('orders')
  if (status && status !== 'all') {
    query = query.where({ status })
  }
  query = query.orderBy('createTime', 'desc')

  const res = await query.get()
  return { list: res.data }
}
