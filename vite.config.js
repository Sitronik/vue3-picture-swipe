import dynamicImportVars from '@rollup/plugin-dynamic-import-vars';
import vue from '@vitejs/plugin-vue';

const path = require('path');

module.exports = {
  outDir: 'dist',
  plugins: [vue()],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/main.js'),
      name: 'VuePictureSwipe'
    },
    rollupOptions: {
      plugins: [dynamicImportVars()],
      external: ['vue'],
      output: [
        {
          assetFileNames: 'vue3-picture-swipe.css',
          format: 'umd',
          globals: {
            vue: 'Vue'
          }
        }
      ]
    }
  }
};
