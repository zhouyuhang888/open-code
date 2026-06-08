Component({
  properties: {
    price: { type: Number, value: 0 },
    originPrice: { type: Number, value: 0 }
  },
  data: {
    displayPrice: '0.00'
  },
  observers: {
    price: function(price) {
      this.setData({ displayPrice: parseFloat(price || 0).toFixed(2) })
    }
  }
})
