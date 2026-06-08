const API = require('../../api/index')
const { showToast, showModal } = require('../../utils/util')

Page({
  data: {
    addressList: [],
    selectMode: false
  },

  onLoad(options) {
    if (options.select === 'true') {
      this.setData({ selectMode: true })
    }
  },

  onShow() {
    this.loadAddresses()
  },

  async loadAddresses() {
    const res = await API.getAddresses()
    this.setData({ addressList: res.data || [] })
  },

  selectAddress(e) {
    if (!this.data.selectMode) return
    const pages = getCurrentPages()
    const prevPage = pages[pages.length - 2]
    if (prevPage) {
      prevPage.setData({ address: e.currentTarget.dataset.item })
    }
    wx.navigateBack()
  },

  addAddress() {
    wx.navigateTo({ url: '/pages/address-edit/address-edit' })
  },

  editAddress(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/address-edit/address-edit?id=${id}` })
  },

  async deleteAddress(e) {
    const id = e.currentTarget.dataset.id
    const confirm = await showModal('提示', '确定删除该地址？')
    if (confirm) {
      await API.deleteAddress(id)
      showToast('已删除', 'success')
      this.loadAddresses()
    }
  }
})
