<script>
import {h, compile} from 'vue';

export default {
  name: 'RenderHtml',
  props: ['template'],
  render() {
    if (!this.template) {
      return h('div', 'loading...');
    } else {
      return h(compile(`${this.template}`));
    }
  }
};
</script>
