import Vue from 'vue'
import VueRouter from 'vue-router'
import Form from '../views/FormView.vue'

Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'history',
  base: import.meta.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Form
    }
  ]
})

export default router
