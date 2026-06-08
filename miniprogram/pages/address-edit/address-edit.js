const API = require('../../api/index')
const { showToast } = require('../../utils/util')

Page({
  data: {
    isEdit: false,
    editId: '',
    form: { name: '', phone: '', detail: '', isDefault: false },
    region: []
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ isEdit: true, editId: options.id })
      this.loadAddress(options.id)
    }
  },

  async loadAddress(id) {
    const res = await API.getAddresses()
    const addr = (res.data || []).find(a => a._id === id)
    if (addr) {
      this.setData({
        form: {
          name: addr.name,
          phone: addr.phone,
          detail: addr.detail,
          isDefault: addr.isDefault || false
        },
        region: [addr.province, addr.city, addr.district].filter(Boolean)
      })
    }
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [`form.${field}`]: e.detail.value })
  },

  onRegionChange(e) {
    this.setData({ region: e.detail.value })
  },

  onDefaultChange(e) {
    this.setData({ 'form.isDefault': e.detail.value })
  },

  async saveAddress() {
    const { form, region, isEdit, editId } = this.data
    if (!form.name) { showToast('请输入收货人'); return }
    if (!/^1\d{10}$/.test(form.phone)) { showToast('请输入正确手机号'); return }
    if (region.length < 3) { showToast('请选择所在地区'); return }
    if (!form.detail) { showToast('请输入详细地址'); return }

    const address = {
      name: form.name,
      phone: form.phone,
      province: region[0],
      city: region[1],
      district: region[2],
      detail: form.detail,
      isDefault: form.isDefault
    }

    if (isEdit) {
      await API.updateAddress(editId, address)
      showToast('修改成功', 'success')
    } else {
      await API.addAddress(address)
      showToast('添加成功', 'success')
    }
    wx.navigateBack()
  },

  async deleteAddress() {
    await API.deleteAddress(this.data.editId)
    showToast('已删除', 'success')
    wx.navigateBack()
  }
})
