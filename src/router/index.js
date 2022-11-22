import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '@/views/HomeView.vue'

Vue.use(VueRouter)

export const routes = [
  {
    path: '/',
    name: 'HomeView',
    component: HomeView
  },
  {
    path: '/demo',
    name: 'demo',
    component: () => import('@/views/demo/DemoEntry.vue'),
    children: [
      {
        path: 'draggable',
        name: 'DraggableDemo',
        component: () => import('@/views/demo/DraggableDemo.vue')
      }
    ]
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
