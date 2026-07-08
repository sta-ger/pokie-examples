export default {
  server: {
    host: true,
  },
  build: {
    rollupOptions: {
      input: {
        page1: 'index.html',
        page2: 'simple-slot.html',
        page3: 'slot-with-free-games.html',
        page4: 'slot-with-sticky-respin.html',
        page5: 'cascading-cluster.html',
      },
    },
  },
  base: "./"
};