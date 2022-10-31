import {Control} from 'rete';
import Vue from 'vue/dist/vue.esm';

const VueNumControl = Vue.component('num', {
  props: ['styles', 'emitter', 'ikey', 'getData', 'putData'],
  template: '<div class="bg-image"' +
    ':value="value" @input="change($event)" :style="styles">\n' +
    '</div>',
  // template: '<input type="number" :readonly="readonly" :value="value" @input="change($event)"/>',
  data() {
    return {
      value: 0,
    };
  },
  methods: {
    change(e) {
      this.value = +e.target.value;
      this.update();
    },
    update() {
      if (this.ikey) {
        this.putData(this.ikey, this.value);
      }
      this.emitter.trigger('process');
    }
  },
  mounted() {
    this.value = this.getData(this.ikey);
  }
});

export class NumControl extends Control {
  component: any;
  props: any;
  vueContext: any;

  constructor(public emitter, public key, styles) {
    super(key);
    styles = 'background: url(' + styles + ') center center no-repeat; background-size: 48px;';
    this.component = VueNumControl;
    this.props = {emitter, ikey: key, styles};
  }

  setValue(val) {
    this.vueContext.value = val;
  }
}
