const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { categoryId, page = 1, pageSize = 10, sort = 'default' } = event
  let query = db.collection('goods').where({ status: 'on' })
  if (categoryId) {
    query = query.where({ categoryId })
  }

  const countResult = await query.count()
  const total = countResult.total
  const skip = (page - 1) * pageSize
  const res = await query.skip(skip).limit(pageSize).get()

  return { list: res.data, total }
}
