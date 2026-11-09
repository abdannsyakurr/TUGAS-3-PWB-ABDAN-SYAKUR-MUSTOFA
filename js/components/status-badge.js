Vue.component('status-badge', {
  template: '#tpl-badge',
  props: { qty: { type: Number, required: true }, safety: { type: Number, required: true } }
});
