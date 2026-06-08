# 农家有机土特产微信小程序 - 部署全流程

---

## 目录
1. [环境准备](#1-环境准备)
2. [项目配置](#2-项目配置)
3. [云开发环境搭建](#3-云开发环境搭建)
4. [创建数据库集合](#4-创建数据库集合)
5. [上传并部署云函数](#5-上传并部署云函数)
6. [初始化基础数据](#6-初始化基础数据)
7. [小程序预览与体验](#7-小程序预览与体验)
8. [提交审核与发布](#8-提交审核与发布)
9. [后续运维](#9-后续运维)

---

## 1. 环境准备

### 1.1 下载微信开发者工具

访问官网下载并安装稳定版：
https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html

### 1.2 注册小程序账号

1. 访问 https://mp.weixin.qq.com/ → 立即注册 → 选择「小程序」
2. 填写邮箱、密码等信息，激活账号
3. 登录小程序管理后台 → 开发 → 开发设置 → 查看 **AppID（小程序ID）**
4. 补充小程序基本信息：名称「农家有机土特产」、头像、简介等

### 1.3 开通微信支付（如需在线支付）

1. 后台 → 功能 → 微信支付 → 开通
2. 提交商户资料（营业执照、法人信息等）
3. 审核通过后获取商户号（mchid）和 API 密钥

---

## 2. 项目配置

### 2.1 导入项目到开发者工具

1. 打开微信开发者工具
2. 点击「导入」按钮
3. 项目目录选择：`miniprogram` 文件夹
4. 填入 **AppID**（在后台获取）
5. 点击「确认」

### 2.2 修改项目配置文件

打开以下文件，替换占位内容：

**project.config.json** — 替换 AppID：
```json
"appid": "wx你的真实AppID"
```

**app.js** — 替换云环境 ID：
```js
wx.cloud.init({
  env: '你的云环境ID',   // ← 替换这里
  traceUser: true
})
```

**cloudfunctions/initData/index.js** — 替换云环境 ID：
```js
cloud.init({ env: '你的云环境ID' })
```

> 云环境 ID 获取方式见 [3.1 开通云开发](#31-开通云开发)

### 2.3 修改占位图标（可选）

`images/` 目录下的 SVG 图标是占位图标，你可以替换为自定义设计。图标要求：
- 尺寸：建议 48×48px
- 格式：支持 PNG / SVG / WebP
- 未选中状态：灰色（#999999）
- 选中状态：绿色（#5B8C2A）

---

## 3. 云开发环境搭建

### 3.1 开通云开发

1. 开发者工具 → 顶部工具栏 → 「云开发」按钮
2. 点击「开通」
3. 选择环境名称（如 `farm-xxx`）
4. 记录 **环境 ID**（如 `farm-123abc`）

### 3.2 修改云函数依赖（关键步骤——腾讯云迁移后必需）

所有云函数目录下都需要安装 `wx-server-sdk` 依赖：

**手动操作方式（每个云函数都要执行）：**

1. 在开发者工具的「资源管理器」中展开 `cloudfunctions/`
2. 右键每个云函数文件夹 → 在「终端」中打开
3. 执行 `npm init -y`（如已有 package.json 则跳过）
4. 执行 `npm install --save wx-server-sdk@latest`
5. 或者在开发者工具中：右键云函数目录 → 选择「安装依赖」（一键安装）

**需要安装的云函数列表：**
- `login`
- `getGoods`
- `createOrder`
- `getOrders`
- `getCart`
- `getCategories`
- `updateCart`
- `initData`
- `merchant/merchantLogin`
- `merchant/merchantAddGoods`
- `merchant/getMerchantOrders`
- `merchant/shipOrder`
- `merchant/getMerchantStats`

> **重要提示**：从 2023 年 9 月起，微信云开发底层架构迁移到腾讯云云开发（TCB），需要确保 node_modules 存在且 `wx-server-sdk` 为最新版。

---

## 4. 创建数据库集合

### 4.1 手动创建集合

1. 开发者工具 → 「云开发」 → 「数据库」
2. 依次创建以下 7 个集合：

| 集合名 | 说明 | 权限设置 |
|--------|------|----------|
| `users` | 用户信息 | 所有用户可读，仅创建者可写 |
| `goods` | 商品 | 所有用户可读，仅创建者可写 |
| `categories` | 分类 | 所有用户可读，仅创建者可写 |
| `cart` | 购物车 | 仅创建者可读写 |
| `orders` | 订单 | 仅创建者可读写 |
| `addresses` | 收货地址 | 仅创建者可读写 |
| `merchants` | 商家账号 | 仅创建者可读写 |

### 4.2 设置数据库权限

**goods 和 categories 集合需要设置为「所有用户可读」**，否则未登录用户无法看到商品。

操作步骤：
1. 进入对应集合 → 「权限设置」tab
2. 选择「自定义安全规则」
3. 输入以下规则：

**goods 集合权限规则：**
```json
{
  "read": true,
  "write": "doc._openid == auth.openid",
  "create": "doc._openid == auth.openid",
  "delete": "doc._openid == auth.openid",
  "update": "doc._openid == auth.openid"
}
```

**categories 集合权限规则：**
```json
{
  "read": true,
  "write": "doc._openid == auth.openid"
}
```

**其他集合（users / cart / orders / addresses）权限规则：**
```json
{
  "read": "doc._openid == auth.openid",
  "write": "doc._openid == auth.openid"
}
```

**merchants 集合权限规则（仅管理员操作）：**
```json
{
  "read": true,
  "write": false
}
```

---

## 5. 上传并部署云函数

### 5.1 安装依赖

在部署前，确保每个云函数目录下都已安装依赖（`node_modules` 目录存在）。

推荐方式：在开发者工具的资源管理器中，**右键每个云函数 → 选择「安装依赖」**。

### 5.2 上传部署

方式一（右键部署）：
1. 展开 `cloudfunctions/` 目录
2. 右键每个云函数 → 「上传并部署：云端安装依赖」
3. 等待部署完成

方式二（批量部署，推荐）：
1. 打开「云开发」控制台 → 「云函数」tab
2. 点击「批量上传」
3. 选择 `cloudfunctions/` 目录
4. 勾选「云端安装依赖」（重要！）

### 5.3 验证云函数

部署完成后，在「云开发控制台 → 云函数」中确认每个云函数的 **状态为「已部署」**。

测试方式：在云函数详情页点「测试」，传入示例参数确认返回正常。

---

## 6. 初始化基础数据（重点）

> **请严格按照以下顺序操作，每一步都不可跳过。**

---

### 6.1 创建分类（categories）

#### 第一步：打开数据库控制台

1. 微信开发者工具 → 顶部工具栏 → 点击「云开发」按钮
2. 在弹出的云开发控制台中，点击左侧菜单「数据库」
3. 在数据库页面中，确保顶部选中的是你的云环境
4. 点击左侧集合列表中的「categories」集合（如果没有，先创建）

#### 第二步：添加分类记录

点击「添加记录」按钮，选择「手动输入」，**一条一条**添加以下 8 条记录：

**记录 1 — 有机蔬菜**
```json
{
  "name": "有机蔬菜",
  "icon": "vegetable",
  "sort": 1
}
```

**记录 2 — 时令水果**
```json
{
  "name": "时令水果",
  "icon": "fruit",
  "sort": 2
}
```

**记录 3 — 五谷粮油**
```json
{
  "name": "五谷粮油",
  "icon": "grain",
  "sort": 3
}
```

**记录 4 — 禽蛋肉类**
```json
{
  "name": "禽蛋肉类",
  "icon": "meat",
  "sort": 4
}
```

**记录 5 — 菌菇干货**
```json
{
  "name": "菌菇干货",
  "icon": "mushroom",
  "sort": 5
}
```

**记录 6 — 土特产**
```json
{
  "name": "土特产",
  "icon": "special",
  "sort": 6
}
```

**记录 7 — 蜂蜜花茶**
```json
{
  "name": "蜂蜜花茶",
  "icon": "honey",
  "sort": 7
}
```

**记录 8 — 手工制品**
```json
{
  "name": "手工制品",
  "icon": "handicraft",
  "sort": 8
}
```

> ⚠️ **注意**：每条记录添加后，系统会自动生成一个 `_id`（如 `881a2b006738...`）。**请复制保存这 8 个 `_id`**，下一步添加商品时需要用到。

---

### 6.2 添加示例商品（goods）

#### 前置条件

上一步中添加分类后，你应该已经得到了 8 个分类的 `_id`。假设：
- 有机蔬菜的 `_id` = `abc111`
- 时令水果的 `_id` = `abc222`
- 五谷粮油的 `_id` = `abc333`

（用你实际得到的 `_id` 替换下面的 `categoryId` 值）

#### 操作步骤

1. 在云开发控制台 → 数据库 → 点击「goods」集合
2. 点击「添加记录」
3. 选择「手动输入」
4. 复制下面的 JSON，**将 `categoryId` 的值换成你实际的分类 ID**
5. 点击「确定」

**商品 1 — 有机生态土鸡蛋**
```json
{
  "name": "有机生态土鸡蛋 30枚装",
  "description": "农家散养土鸡，林下放养，吃虫吃草，营养丰富",
  "price": 68,
  "originPrice": 88,
  "stock": 200,
  "sales": 156,
  "origin": "云南大理",
  "isOrganic": true,
  "isLocal": true,
  "categoryId": "这里填有机蔬菜的分类 _id",
  "images": [
    "https://via.placeholder.com/400x400/5B8C2A/FFFFFF?text=Organic+Eggs"
  ],
  "specs": [
    {
      "name": "规格",
      "options": [
        { "value": "30枚装", "price": 68, "stock": 200 },
        { "value": "60枚装", "price": 128, "stock": 100 }
      ]
    }
  ],
  "detail": "<p>农家散养土鸡，林下放养，吃虫吃草，天然无公害。</p><p>蛋黄饱满，蛋白浓稠，营养丰富。</p>",
  "status": "on",
  "createTime": null
}
```

**商品 2 — 高山有机大白菜**
```json
{
  "name": "高山有机大白菜",
  "description": "海拔2000米以上高山种植，清甜爽口",
  "price": 29.9,
  "originPrice": 39.9,
  "stock": 500,
  "sales": 320,
  "origin": "云南丽江",
  "isOrganic": true,
  "isLocal": true,
  "categoryId": "这里填有机蔬菜的分类 _id",
  "images": [
    "https://via.placeholder.com/400x400/7CB342/FFFFFF?text=Cabbage"
  ],
  "specs": [
    {
      "name": "重量",
      "options": [
        { "value": "2.5kg", "price": 29.9, "stock": 500 },
        { "value": "5kg", "price": 49.9, "stock": 300 }
      ]
    }
  ],
  "detail": "<p>高山种植，昼夜温差大，糖分积累充分。</p><p>清甜脆嫩，适合炖煮、清炒。</p>",
  "status": "on",
  "createTime": null
}
```

**商品 3 — 古法压榨菜籽油**
```json
{
  "name": "古法压榨菜籽油 2.5L",
  "description": "传统物理压榨，无添加，香浓纯正",
  "price": 89,
  "originPrice": 109,
  "stock": 150,
  "sales": 89,
  "origin": "四川绵阳",
  "isOrganic": false,
  "isLocal": true,
  "categoryId": "这里填五谷粮油的分类 _id",
  "images": [
    "https://via.placeholder.com/400x400/D4A843/FFFFFF?text=Oil"
  ],
  "specs": [
    {
      "name": "容量",
      "options": [
        { "value": "1L装", "price": 45, "stock": 150 },
        { "value": "2.5L装", "price": 89, "stock": 100 }
      ]
    }
  ],
  "detail": "<p>精选非转基因油菜籽，传统古法压榨。</p><p>零添加，保留菜籽原香，炒菜更香浓。</p>",
  "status": "on",
  "createTime": null
}
```

**商品 4 — 高山野生蜂蜜**
```json
{
  "name": "高山野生百花蜜 500g",
  "description": "高海拔山区野生蜂蜜，天然成熟蜜",
  "price": 128,
  "originPrice": 158,
  "stock": 80,
  "sales": 210,
  "origin": "四川阿坝",
  "isOrganic": true,
  "isLocal": true,
  "categoryId": "这里填蜂蜜花茶的分类 _id",
  "images": [
    "https://via.placeholder.com/400x400/F5A623/FFFFFF?text=Honey"
  ],
  "specs": [
    {
      "name": "规格",
      "options": [
        { "value": "250g", "price": 68, "stock": 100 },
        { "value": "500g", "price": 128, "stock": 80 }
      ]
    }
  ],
  "detail": "<p>高海拔山区野生蜂蜜，一年只取一次。</p><p>天然成熟蜜，营养价值极高。</p>",
  "status": "on",
  "createTime": null
}
```

> **商品图片说明**：上面的 `images` 字段使用了占位图链接（via.placeholder.com），可以正常显示。你也可以在添加后，在商品管理页面上传真实的商品图片。

---

### 6.3 创建商家账号（merchants）

1. 在云开发控制台 → 数据库 → 点击「merchants」集合
2. 点击「添加记录」
3. 选择「手动输入」
4. 复制下面的 JSON，点击「确定」

```json
{
  "account": "admin",
  "password": "admin123",
  "name": "农家有机旗舰店"
}
```

> **商家端登录地址**：小程序中「我的」→「商家入驻」→ 输入账号 `admin`、密码 `admin123`

---

### 6.4 验证数据是否添加成功

在数据库中检查各个集合的数据条数：

| 集合 | 应有数据条数 |
|------|------------|
| `categories` | 8 条 |
| `goods` | 至少 3 条 |
| `merchants` | 1 条 |
| `users` | 0 条（用户首次登录时自动创建） |
| `cart` | 0 条（用户添加购物车时自动创建） |
| `orders` | 0 条（用户下单时自动创建） |
| `addresses` | 0 条（用户添加地址时自动创建） |

### 6.5 常见错误

| 错误 | 原因 | 解决方法 |
|------|------|---------|
| 添加记录时提示 JSON 格式错误 | 复制时多了或少了逗号 | 检查 JSON 格式，使用 https://json.cn 验证 |
| goods 页面不显示商品 | `categoryId` 填写错误 | 确认填的是 categories 集合中存在的 `_id` 值 |
| 商家端登录提示「账号或密码错误」 | merchants 集合没有数据 | 检查是否按步骤 6.3 添加了商家账号 |
| 添加商品后首页不显示 | 数据库权限未设置 | 检查 goods 集合的权限规则，确认设为「所有用户可读」 |

---

## 7. 小程序预览与体验

### 7.1 本地预览

1. 开发者工具工具栏 → 「编译」按钮（或 Ctrl + B）
2. 在模拟器中查看效果
3. 检查各页面功能：
   - 首页轮播图、分类导航、推荐商品
   - 分类页左右切换
   - 商品详情规格选择
   - 购物车增删改
   - 地址管理
   - 订单流程
   - 商家端登录和管理

### 7.2 真机预览

1. 工具栏 → 「预览」按钮
2. 使用微信扫码在手机上查看

> 真机预览需要先在「小程序管理后台 → 开发 → 开发设置」中将测试微信号添加到「开发者」列表中。

### 7.3 常见问题排查

| 问题 | 原因 | 解决 |
|------|------|------|
| 页面空白或报错 `env not found` | 云环境 ID 未配置或错误 | 检查 `app.js` 中的 `env` 参数 |
| 云函数调用失败 | 云函数未部署或依赖未安装 | 重新部署并勾选「云端安装依赖」 |
| 商品数据不显示 | 数据库权限未设置 | 检查 goods 集合的权限规则 |
| 登录失败 | 云函数 login 未部署 | 部署 login 云函数 |
| wx.getUserProfile 报错 | 微信官方调整接口策略 | 降级使用 wx.getUserInfo 或使用头像昵称填写能力 |
| tabBar 图标不显示 | 图片路径或格式不对 | 检查 app.json 路径，使用 PNG 格式 |

---

## 8. 提交审核与发布

### 8.1 提交前检查清单

- [ ] 所有云函数已成功部署并可调用
- [ ] 数据库集合已创建且权限正确
- [ ] 基础数据已初始化
- [ ] 小程序的名称、头像、简介已在后台设置
- [ ] 「用户隐私保护指引」已填写（后台 → 设置 → 服务内容声明）
- [ ] 「小程序类目」已设置（建议选择：电商平台 > 食品）
- [ ] 已添加测试体验版（可选）

### 8.2 上传代码

1. 开发者工具 → 工具栏 → 「上传」
2. 填写版本号（如 `1.0.0`）
3. 填写项目备注（如「首次发布」）
4. 点击「上传」

### 8.3 提交审核

1. 登录小程序管理后台 → 「版本管理」
2. 找到「开发版本」中的刚刚上传的版本
3. 点击「提交审核」
4. 填写审核信息：
   - **功能页面**：列出主要功能页面
   - **测试账号**：提供商家端测试账号（admin / admin123）
   - **测试说明**：说明这是农家土特产购物平台
5. 点击「提交」

### 8.4 审核与发布

1. 审核通常在 **1-7 个工作日** 完成
2. 审核通过后，在后台点击「发布」
3. 用户即可在微信中搜索到小程序

---

## 9. 后续运维

### 9.1 日常维护

- **商品管理**：通过商家端页面或云开发控制台维护商品
- **订单处理**：商家端页面查看订单并发货
- **数据统计**：商家端查看基本销售数据

### 9.2 代码更新

1. 修改代码后，在开发者工具中测试
2. 点击「上传」更新版本
3. 后台提交审核并发布

### 9.3 云资源监控

云开发控制台提供：
- **存储**：图片/文件占用空间
- **数据库**：读写次数、存储空间
- **云函数**：调用次数、资源消耗

免费额度（每月）：
- 数据库：读 50,000 次 / 写 30,000 次
- 存储：2GB
- 云函数：100 万次调用

超出后需要付费，建议关注控制台用量。

### 9.4 数据备份

建议定期（每周）在云开发控制台 → 数据库 → 导出数据，备份关键集合：
- `orders`（订单数据不可丢失）
- `goods`（商品数据）
- `merchants`（商家账号）

---

## 附录

### 常用链接

| 用途 | 链接 |
|------|------|
| 小程序管理后台 | https://mp.weixin.qq.com/ |
| 微信开发者工具下载 | https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html |
| 云开发文档 | https://developers.weixin.qq.com/miniprogram/dev/wxcloud/ |
| 小程序设计指南 | https://developers.weixin.qq.com/miniprogram/design/ |

### 关键文件说明

| 文件 | 作用 |
|------|------|
| `app.js` | 全局逻辑，云开发初始化 |
| `app.json` | 全局配置，页面注册，TabBar |
| `app.wxss` | 全局样式，CSS 变量 |
| `api/index.js` | 所有云数据库和云函数调用封装 |
| `project.config.json` | 开发者工具配置，需填写 AppID |
