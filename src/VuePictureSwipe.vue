<template>
  <div>
    <div class="my-gallery" itemscope itemtype="http://schema.org/ImageGallery">
      <figure
        v-for="(item, index) in items"
        v-show="index === 0 || !singleThumbnail"
        :key="index"
        class="gallery-thumbnail"
        itemprop="associatedMedia"
        itemscope
        itemtype="http://schema.org/ImageObject"
        :src="item.src"
      >
        <a
          v-show="nbThumbnailsDisplayed === -1 || index < nbThumbnailsDisplayed"
          :href="item.src"
          itemprop="contentUrl"
          :data-size="`${item.w}x${item.h}`"
          :title="item.title"
        >
          <img :src="item.thumbnail" :alt="item.alt" itemprop="thumbnail" />
        </a>
        <render-html v-if="item.htmlAfterThumbnail" :template="item.htmlAfterThumbnail" />
      </figure>
    </div>

    <photo-swipe-component
      v-if="defaultStructure"
      :options="options"
      @open="$emit('open')"
      @close="$emit('close')"
    />
  </div>
</template>

<script>
import PhotoSwipeComponent from './PhotoSwipeComponent.vue';
import RenderHtml from './RenderHtml.vue';

export default {
  components: {PhotoSwipeComponent, RenderHtml},
  props: {
    items: {
      default: [
        {
          src: 'http://via.placeholder.com/600x400',
          thumbnail: 'http://via.placeholder.com/64x64',
          w: 0,
          h: 0,
          alt: 'some numbers on a grey background',
          htmlAfterThumbnail: '<span class="photos-date">29.12.2021</span>'
        },
        {
          src: 'http://via.placeholder.com/1200x900',
          thumbnail: 'http://via.placeholder.com/64x64',
          w: 0,
          h: 0,
          htmlAfterThumbnail: ''
        }
      ],
      type: Array
    },
    options: {
      default: () => ({}),
      type: Object
    },
    singleThumbnail: {
      type: Boolean,
      default: false
    },
    nbThumbnailsDisplayed: {
      default: -1,
      type: Number
    },
    defaultStructure: {
      type: Boolean,
      default: true
    }
  }
};

</script>
<style scoped>
  .gallery-thumbnail {
    display: inline;
    margin: 5px;
  }
</style>

