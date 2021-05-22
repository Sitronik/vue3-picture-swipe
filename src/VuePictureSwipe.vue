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
      </figure>
    </div>

    <div class="pswp"
         tabindex="-1"
         role="dialog"
         aria-hidden="true"
    >
      <div class="pswp__bg"></div>
      <div class="pswp__scroll-wrap">
        <div class="pswp__container">
          <div class="pswp__item"></div>
          <div class="pswp__item"></div>
          <div class="pswp__item"></div>
        </div>
        <div class="pswp__ui pswp__ui--hidden">
          <div class="pswp__top-bar">
            <div class="pswp__counter"></div>
            <button class="pswp__button pswp__button--close" title="Close (Esc)"></button>

            <button v-if="options.rotationOn"
                    class="pswp__button pswp__button--rotate pswp__button--rotate--left"
                    title="Rotate left"
                    @click="rotate(-90)"
            ></button>
            <button v-if="options.rotationOn"
                    class="pswp__button pswp__button--rotate pswp__button--rotate--right"
                    title="Rotate right"
                    @click="rotate(90)"
            ></button>

            <button class="pswp__button pswp__button--share" title="Share"></button>
            <button class="pswp__button pswp__button--fs" title="Toggle fullscreen"></button>
            <button class="pswp__button pswp__button--zoom" title="Zoom in/out"></button>
            <div class="pswp__preloader">
              <div class="pswp__preloader__icn">
                <div class="pswp__preloader__cut">
                  <div class="pswp__preloader__donut"></div>
                </div>
              </div>
            </div>
          </div>
          <div class="pswp__share-modal pswp__share-modal--hidden pswp__single-tap">
            <div class="pswp__share-tooltip"></div>
          </div>
          <button class="pswp__button pswp__button--arrow--left" title="Previous (arrow left)" @click="resetAngle">
          </button>
          <button class="pswp__button pswp__button--arrow--right" title="Next (arrow right)" @click="resetAngle">
          </button>
          <div class="pswp__caption">
            <div class="pswp__caption__center"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PhotoSwipe from 'photoswipe/dist/photoswipe';
import PhotoSwipeUI_Default from 'photoswipe/dist/photoswipe-ui-default';
import 'photoswipe/dist/photoswipe.css';
import 'photoswipe/dist/default-skin/default-skin.css';

export default {
  props: {
    items: {
      default: [
        {
          src: 'http://via.placeholder.com/600x400',
          thumbnail: 'http://via.placeholder.com/64x64',
          w: 0,
          h: 0,
          alt: 'some numbers on a grey background'
        },
        {
          src: 'http://via.placeholder.com/1200x900',
          thumbnail: 'http://via.placeholder.com/64x64',
          w: 0,
          h: 0
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
    }
  },
  data() {
    return {
      pswp: null,
      angle: 0
    };
  },
  mounted() {
    const self = this;
    const initPhotoSwipeFromDOM = function (gallerySelector) {

      // parse slide data (url, title, size ...) from DOM elements
      // (children of gallerySelector)
      const parseThumbnailElements = function (el) {
        const thumbElements = el.childNodes;
        const numNodes = thumbElements.length;
        const items = [];

        let figureEl,
          linkEl,
          size,
          item;

        for (let i = 0; i < numNodes; i++) {

          figureEl = thumbElements[i]; // <figure> element

          // include only element nodes
          if (figureEl.nodeType !== 1) {
            continue;
          }

          linkEl = figureEl.children[0]; // <a> element

          size = linkEl.getAttribute('data-size').split('x');

          // create slide object
          item = {
            src: linkEl.getAttribute('href'),
            w: parseInt(size[0], 10),
            h: parseInt(size[1], 10),
            title: linkEl.getAttribute('title')
          };


          if (figureEl.children.length > 1) {
            // <figcaption> content
            item.title = figureEl.children[1].innerHTML;
          }

          if (linkEl.children.length > 0) {
            // <img> thumbnail element, retrieving thumbnail url
            item.msrc = linkEl.children[0].getAttribute('src');
          }

          item.el = figureEl; // save link to element for getThumbBoundsFn
          items.push(item);
        }

        return items;
      };

      // find nearest parent element
      const closest = function closest(el, fn) {
        return el && (fn(el) ? el : closest(el.parentNode, fn));
      };

      // triggers when user clicks on thumbnail
      const onThumbnailsClick = function (e) {
        e = e || window.event;
        e.preventDefault ? e.preventDefault() : e.returnValue = false;

        const eTarget = e.target || e.srcElement;

        // find root element of slide
        const clickedListItem = closest(eTarget, (el) => {
          return (el.tagName && el.tagName.toUpperCase() === 'FIGURE');
        });

        if (!clickedListItem) {
          return;
        }

        // find index of clicked item by looping through all child nodes
        // alternatively, you may define index via data- attribute
        const clickedGallery = clickedListItem.parentNode;
        const childNodes = clickedListItem.parentNode.childNodes;
        const numChildNodes = childNodes.length;

        let nodeIndex = 0,
          index;

        for (let i = 0; i < numChildNodes; i++) {
          if (childNodes[i].nodeType !== 1) {
            continue;
          }

          if (childNodes[i] === clickedListItem) {
            index = nodeIndex;
            break;
          }
          nodeIndex++;
        }


        if (index >= 0) {
          // open PhotoSwipe if valid index found
          openPhotoSwipe(index, clickedGallery);
        }
        return false;
      };

      // parse picture index and gallery index from URL (#&pid=1&gid=2)
      const photoswipeParseHash = function () {
        const hash = window.location.hash.substring(1),
          params = {};

        if (hash.length < 5) {
          return params;
        }

        const vars = hash.split('&');
        for (let i = 0; i < vars.length; i++) {
          if (!vars[i]) {
            continue;
          }
          const pair = vars[i].split('=');
          if (pair.length < 2) {
            continue;
          }
          params[pair[0]] = pair[1];
        }

        if (params.gid) {
          params.gid = parseInt(params.gid, 10);
        }

        return params;
      };

      const openPhotoSwipe = function (index, galleryElement, disableAnimation, fromURL) {
        const pswpElement = galleryElement.parentElement.querySelector('.pswp');
        const items = parseThumbnailElements(galleryElement);

        // define options (if needed)
        const options = {
          // define gallery index (for URL)
          galleryUID: galleryElement.getAttribute('data-pswp-uid'),

          getThumbBoundsFn (index) {
            // See Options -> getThumbBoundsFn section of documentation for more info
            const thumbnail = items[index].el.getElementsByTagName('img')[0], // find thumbnail
              pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
              rect = thumbnail.getBoundingClientRect();

            return {x: rect.left, y: rect.top + pageYScroll, w: rect.width};
          }
        };

        // PhotoSwipe opened from URL
        if (fromURL) {
          if (options.galleryPIDs) {
            // parse real index when custom PIDs are used
            // http://photoswipe.com/documentation/faq.html#custom-pid-in-url
            for (let j = 0; j < items.length; j++) {
              if (items[j].pid === index) {
                options.index = j;
                break;
              }
            }
          } else {
            // in URL indexes start from 1
            options.index = parseInt(index, 10) - 1;
          }
        } else {
          options.index = parseInt(index, 10);
        }

        // exit if index not found
        if (isNaN(options.index)) {
          return;
        }

        if (disableAnimation) {
          options.showAnimationDuration = 0;
        }

        // Pass data to PhotoSwipe and initialize it
        const gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, Object.assign(options, self.options));
        gallery.listen('gettingData', (index, item) => {
          if (item.w < 1 || item.h < 1) { // unknown size
            const img = new Image();
            img.onload = function() { // will get size after load
              item.w = this.width; // set image width
              item.h = this.height; // set image height
              gallery.invalidateCurrItems(); // reinit Items
              gallery.updateSize(true); // reinit Items
            };
            img.src = item.src; // let's download image
          }
        });
        gallery.init();
        self.pswp = gallery;

        // trigger open event after swiper is opened
        self.$emit('open');

        // trigger close event after swiper is closed
        gallery.listen('destroy', () => self.$emit('close'));
      };

      // loop through all gallery elements and bind events
      const galleryElements = document.querySelectorAll(gallerySelector);

      for (let i = 0, l = galleryElements.length; i < l; i++) {
        galleryElements[i].setAttribute('data-pswp-uid', i + 1);
        galleryElements[i].onclick = onThumbnailsClick;
      }

      // Parse URL and open gallery if it contains #&pid=3&gid=1
      const hashData = photoswipeParseHash();
      if (hashData.pid && hashData.gid) {
        openPhotoSwipe(hashData.pid, galleryElements[hashData.gid - 1], true, true);
      }
    };

    initPhotoSwipeFromDOM('.my-gallery');
  },
  methods: {
    rotate(newAngle) {
      this.angle += newAngle;
      this.$el.querySelectorAll('.pswp__img').forEach(i => i.style.transform = `rotate(${this.angle}deg)`);
    },
    resetAngle() {
      this.angle = 0;
      this.$el.querySelectorAll('.pswp__img').forEach(i => i.style.transform = `rotate(${this.angle}deg)`);
    }
  }
};
</script>
<style scoped>
  .pswp__top-bar {
    text-align: right;
  }
  .pswp__caption__center {
    text-align: center
  }
  .pswp__button--rotate {
    background: url(./icons/rotate.png) 0 0 no-repeat;
    background-size: 62px 24px;
  }
  .pswp__button--rotate--left {
    background-position: 8px 10px;
  }
  .pswp__button--rotate--right {
    background-position: -26px 10px;
  }
  .gallery-thumbnail {
    display: inline;
    margin: 5px;
  }
</style>
