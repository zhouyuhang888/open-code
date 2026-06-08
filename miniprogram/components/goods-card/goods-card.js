Component({
  properties: {
    goods: { type: Object, value: {} }
  },
  data: {
    placeholderImg: 'https://via.placeholder.com/340/5B8C2A/ffffff?text=农家'
  },
  methods: {
    onTap() {
      this.triggerEvent('tap', { id: this.properties.goods._id })
    }
  }
})
