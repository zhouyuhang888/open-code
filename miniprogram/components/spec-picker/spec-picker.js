Component({
  properties: {
    specList: { type: Array, value: [] }
  },
  methods: {
    onSelect(e) {
      const { group, value } = e.currentTarget.dataset
      this.triggerEvent('select', { group, value })
    }
  }
})
