/**
 * 数据库初始化脚本
 * 
 * 在微信开发者工具中 -> 云开发 -> 数据库 -> 依次创建以下集合:
 *   users, goods, categories, cart, orders, addresses, merchants
 * 
 * 然后在云开发控制台 -> 云函数 -> 右键各云函数 -> 上传并部署
 * 之后运行此脚本初始化基础数据。
 */

const cloud = require('wx-server-sdk')
cloud.init({ env: 'cloud1-d9gkhxg0k1c78555c' })
const db = cloud.database()

async function initData() {
  console.log('开始初始化数据库...')

  // 1. 创建分类
  const categories = [
    { name: '有机蔬菜', icon: '🥬', banner: '', sort: 1 },
    { name: '时令水果', icon: '🍎', banner: '', sort: 2 },
    { name: '五谷粮油', icon: '🌾', banner: '', sort: 3 },
    { name: '禽蛋肉类', icon: '🥚', banner: '', sort: 4 },
    { name: '菌菇干货', icon: '🍄', banner: '', sort: 5 },
    { name: '土特产', icon: '🥜', banner: '', sort: 6 },
    { name: '蜂蜜花茶', icon: '🍯', banner: '', sort: 7 },
    { name: '手工制品', icon: '🧺', banner: '', sort: 8 }
  ]

  for (const cat of categories) {
    await db.collection('categories').add({ data: cat })
  }
  console.log('分类初始化完成')

  // 2. 创建示例商品
  const sampleGoods = [
    {
      name: '有机生态土鸡蛋 30枚装',
      description: '农家散养土鸡，林下放养，吃虫吃草，营养丰富',
      price: 68,
      originPrice: 88,
      stock: 200,
      sales: 156,
      origin: '云南大理',
      isOrganic: true,
      isLocal: true,
      categoryId: '',  // 替换为实际 category _id
      images: ['https://via.placeholder.com/400/5B8C2A/ffffff?text=土鸡蛋'],
      specs: [
        { name: '规格', options: [
          { value: '30枚装', price: 68, stock: 200 },
          { value: '60枚装', price: 128, stock: 100 }
        ]}
      ],
      detail: '<p>农家散养土鸡，林下放养，吃虫吃草，天然无公害。</p><p>蛋黄饱满，蛋白浓稠，营养丰富。</p>',
      status: 'on'
    },
    {
      name: '高山有机大白菜',
      description: '海拔2000米以上高山种植，清甜爽口',
      price: 29.9,
      originPrice: 39.9,
      stock: 500,
      sales: 320,
      origin: '云南丽江',
      isOrganic: true,
      isLocal: true,
      categoryId: '',
      images: ['https://via.placeholder.com/400/7CB342/ffffff?text=大白菜'],
      specs: [
        { name: '重量', options: [
          { value: '2.5kg', price: 29.9, stock: 500 },
          { value: '5kg', price: 49.9, stock: 300 }
        ]}
      ],
      detail: '<p>高山种植，昼夜温差大，糖分积累充分。</p><p>清甜脆嫩，适合炖煮、清炒。</p>',
      status: 'on'
    },
    {
      name: '古法压榨菜籽油',
      description: '传统物理压榨，无添加，香浓纯正',
      price: 89,
      originPrice: 109,
      stock: 150,
      sales: 89,
      origin: '四川绵阳',
      isOrganic: false,
      isLocal: true,
      categoryId: '',
      images: ['https://via.placeholder.com/400/D4A843/ffffff?text=菜籽油'],
      specs: [
        { name: '容量', options: [
          { value: '1L装', price: 45, stock: 150 },
          { value: '2.5L装', price: 89, stock: 100 }
        ]}
      ],
      detail: '<p>精选非转基因油菜籽，传统古法压榨。</p><p>零添加，保留菜籽原香，炒菜更香浓。</p>',
      status: 'on'
    }
  ]

  for (const goods of sampleGoods) {
    await db.collection('goods').add({ data: goods })
  }
  console.log('示例商品初始化完成')

  // 3. 创建商家账号（默认）
  const merchants = [
    {
      account: 'admin',
      password: 'admin123',
      name: '农家有机旗舰店',
      createTime: db.serverDate()
    }
  ]

  for (const m of merchants) {
    const exist = await db.collection('merchants').where({ account: m.account }).get()
    if (exist.data.length === 0) {
      await db.collection('merchants').add({ data: m })
    }
  }
  console.log('商家账号初始化完成')

  console.log('数据库初始化完成！')
  return { success: true }
}

initData()
