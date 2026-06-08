Component({
  properties: {
    loading: { type: Boolean, value: false },
    hasMore: { type: Boolean, value: true }
  },
  data: {
    finished: false
  },
  observers: {
    'loading, hasMore': function() {
      if (!this.properties.loading && !this.properties.hasMore) {
        this.setData({ finished: true })
      }
    }
  }
})
