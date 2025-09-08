import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

// 解决导航栏或者底部导航tabBar中的vue-router在3.0版本以上频繁点击菜单报错的问题。
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push (location) {
  return originalPush.call(this, location).catch(err => err)
}

const routes = [
  {
    path: '/front',
    name: 'Front',
    component: () => import('../views/Front.vue'),
    children: [
      { path: '', name: 'Home', meta: { name: '首页' }, component: () => import('../views/front/Home.vue') },
      { path: 'person', name: 'Person', meta: { name: '个人中心' }, component: () => import('../views/front/Person.vue') }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue')
  },
  {
    path: '/manager',
    name: 'Manager',
    component: () => import('../views/Manager.vue'),
    children: [
      { path: '', name: 'Home', meta: { name: '首页' }, component: () => import('../views/manager/Home.vue') },
      { path: 'admin', name: 'Admin', meta: { name: '管理员管理' }, component: () => import('../views/manager/Admin.vue') },
      { path: 'staff', name: 'Staff', meta: { name: '员工管理' }, component: () => import('../views/manager/Staff.vue') },
      { path: 'department', name: 'Department', meta: { name: '部门管理' }, component: () => import('../views/manager/Department.vue') },
      { path: 'category', name: 'Category', meta: { name: '分类管理' }, component: () => import('../views/manager/Category.vue') },
      { path: 'assets', name: 'Assets', meta: { name: '资产管理' }, component: () => import('../views/manager/Assets.vue') },
      { path: 'assetsIn', name: 'AssetsIn', meta: { name: '资产入库' }, component: () => import('../views/manager/AssetsIn.vue') },
      { path: 'assetsReceive', name: 'AssetsReceive', meta: { name: '资产领用' }, component: () => import('../views/manager/AssetsReceive.vue') },
      { path: 'assetsRepair', name: 'AssetsRepair', meta: { name: '资产维修' }, component: () => import('../views/manager/AssetsRepair.vue') },
      { path: 'inventory', name: 'Inventory', meta: { name: '资产盘点' }, component: () => import('../views/manager/Inventory.vue') },
      { path: 'assetsTransfer', name: 'AssetsTransfer', meta: { name: '资产调拨' }, component: () => import('../views/manager/AssetsTransfer.vue') },
      { path: 'notice', name: 'Notice', meta: { name: '公告管理' }, component: () => import('../views/manager/Notice.vue') },
      { path: 'integration', name: 'Integration', meta: { name: '集成管理' }, component: () => import('../views/manager/Integration.vue') },
      { path: 'apiConfig', name: 'ApiConfig', meta: { name: '接口管理' }, component: () => import('../views/manager/ApiConfig.vue') },
      { path: 'adminPerson', name: 'AdminPerson', meta: { name: '个人中心' }, component: () => import('../views/manager/AdminPerson.vue') },
      { path: 'staffPerson', name: 'StaffPerson', meta: { name: '个人中心' }, component: () => import('../views/manager/StaffPerson.vue') },
      { path: 'staffAssets', name: 'StaffAssets', meta: { name: '我的资产' }, component: () => import('../views/manager/StaffAssets.vue') },
      { path: 'password', name: 'Password', meta: { name: '修改密码' }, component: () => import('../views/manager/Password.vue') },
      { path: '403', name: 'NoAuth', meta: { name: '无权限' }, component: () => import('../views/manager/403.vue') }
    ]
  },
  {
    path: '/wechatCallback',
    name: 'WechatCallback',
    component: () => import('../views/WechatCallback.vue')
  },
  {
    path: '*',
    name: '404',
    component: () => import('../views/404.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

// 注：不需要前台的项目，可以注释掉该路由守卫
// 路由守卫
router.beforeEach((to ,from, next) => {
  let user = JSON.parse(localStorage.getItem("xm-user") || '{}');
  if (to.path === '/') {
    if (user.role) {
      if (user.role === 'USER') {
        next('/front')
      } else {
        next('/manager')
      }
    } else {
      next('/login')
    }
  } else {
    next()
  }
})

export default router
