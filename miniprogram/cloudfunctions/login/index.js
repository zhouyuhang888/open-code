const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()

  const exist = await db.collection('users').where({
    _openid: OPENID
  }).get()

  if (exist.data.length === 0) {
    await db.collection('users').add({
      data: {
        _openid: OPENID,
        createTime: db.serverDate()
      }
    })
  }

  return {
    success: true,
    openid: OPENID
  }
}
