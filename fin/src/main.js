import Vue from 'vue'

import App from './App.vue'
import router from './router'
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue'
import './assets/main.css'
import 'bootstrap/dist/css/bootstrap.css';
import "bootstrap-vue/dist/bootstrap-vue.css";
import LoadScript from 'vue-plugin-load-script';

Vue.use(BootstrapVue)
Vue.use(BootstrapVueIcons)
Vue.use(LoadScript)
new Vue({
  router,
  render: (h) => h(App)
}).$mount('#app')
