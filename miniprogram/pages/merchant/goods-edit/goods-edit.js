const API = require('../../../api/index')
const { showToast, showLoading, hideLoading } = require('../../../utils/util')

Page({
  data: {
    isEdit: false,
    editId: '',
    form: {
      name: '', description: '', categoryId: '', price: '', originPrice: '',
      stock: '', origin: '', isOrganic: false, isLocal: false, images: []
    },
    categories: [],
    selectedCategoryName: ''
  },

  onLoad(options) {
    this.loadCategories()
    if (options.id) {
      this.setData({ isEdit: true, editId: options.id })
      this.loadGoods(options.id)
    }
  },

  async loadCategories() {
    const res = await API.getCategories()
    this.setData({ categories: res.data || [] })
  },

  async loadGoods(id) {
    const res = await API.getGoodsDetail(id)
    const goods = res.data || {}
    const cat = this.data.categories.find(c => c._id === goods.categoryId)
    this.setData({
      form: {
        name: goods.name || '',
        description: goods.description || '',
        categoryId: goods.categoryId || '',
        price: String(goods.price || ''),
        originPrice: String(goods.originPrice || ''),
        stock: String(goods.stock || ''),
        origin: goods.origin || '',
        isOrganic: goods.isOrganic || false,
        isLocal: goods.isLocal || false,
        images: goods.images || []
      },
      selectedCategoryName: cat ? cat.name : ''
    })
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [`form.${field}`]: e.detail.value })
  },

  onSwitchChange(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [`form.${field}`]: e.detail.value })
  },

  onCategoryChange(e) {
    const index = e.detail.value
    const cat = this.data.categories[index]
    if (cat) {
      this.setData({ 'form.categoryId': cat._id, selectedCategoryName: cat.name })
    }
  },

  async uploadImage() {
    wx.chooseMedia({
      count: 9 - this.data.form.images.length,
      mediaType: ['image'],
      success: (res) => {
        const tempFiles = res.tempFiles || []
        Promise.all(tempFiles.map(f => this.uploadToCloud(f.tempFilePath))).then(urls => {
          this.setData({ 'form.images': [...this.data.form.images, ...urls] })
        })
      }
    })
  },

  async uploadToCloud(filePath) {
    const ext = filePath.split('.').pop()
    const cloudPath = `goods/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
    const res = await wx.cloud.uploadFile({ cloudPath, filePath })
    return res.fileID
  },

  removeImage(e) {
    const index = e.currentTarget.dataset.index
    const images = this.data.form.images.filter((_, i) => i !== index)
    this.setData({ 'form.images': images })
  },

  async saveGoods() {
    const { form, isEdit, editId } = this.data
    if (!form.name) { showToast('请输入商品名称'); return }
    if (!form.price) { showToast('请输入商品价格'); return }

    showLoading('保存中...')
    const goodsData = {
      ...form,
      price: parseFloat(form.price),
      originPrice: form.originPrice ? parseFloat(form.originPrice) : null,
      stock: parseInt(form.stock) || 0,
      status: 'on'
    }

    try {
      if (isEdit) {
        await API.updateGoods(editId, goodsData)
        showToast('修改成功', 'success')
      } else {
        await API.addGoods(goodsData)
        showToast('添加成功', 'success')
      }
      hideLoading()
      wx.navigateBack()
    } catch (err) {
      hideLoading()
      showToast('保存失败')
    }
  }
})
