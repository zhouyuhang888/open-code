const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { account, password } = event

  const res = await db.collection('merchants').where({
    account,
    password
  }).get()

  if (res.data.length > 0) {
    const merchant = res.data[0]
    return {
      success: true,
      merchant: {
        _id: merchant._id,
        name: merchant.name,
        account: merchant.account
      }
    }
  }

  return { success: false, message: '账号或密码错误' }
}
