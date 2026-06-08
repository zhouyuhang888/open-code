const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { orderId, logistics, shipTime } = event

  await db.collection('orders').doc(orderId).update({
    data: {
      status: 'shipped',
      logistics: logistics || '',
      shipTime: shipTime || db.serverDate()
    }
  })

  return { success: true }
}
