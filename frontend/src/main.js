import { createApp } from 'vue'
import './index.css'
import App from './App.vue'

import { createRouter, createWebHistory } from 'vue-router'


// Define routes
// We will lazy load components or import them directly.
// Since components don't exist yet, I will create a basic App.vue first and then routes.
// Actually, let's define routes in a separate file or inline if simple.

const routes = [
    {
        path: '/',
        component: () => import('./components/MainView.vue') // separating main view to keep App.vue clean
    },

]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

createApp(App).use(router).mount('#app')
