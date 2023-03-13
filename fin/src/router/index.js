import Vue from 'vue'
import VueRouter from 'vue-router'
import Form from '../views/FormView.vue'

Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'hash',
  base: import.meta.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Form,

      meta:{
        title: "User Study"
      }
    }
  ]
})

router.afterEach((to, from) => {
  // Use next tick to handle router history correctly
  // see: https://github.com/vuejs/vue-router/issues/914#issuecomment-384477609
  Vue.nextTick(() => {
      document.title = to.meta.title || "Memit Explorer";
  });
});

export default router
