<template>
  <div class="manager-container">
    <!--  头部  -->
    <div class="manager-header">
      <div class="manager-header-left">
        <!-- <img src="@/assets/imgs/logo.png" /> -->
        <div class="title">Y-固定资产管理系统</div>
      </div>

      <div class="manager-header-center">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: $route.path }">{{ $route.meta.name }}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <div class="manager-header-right">
        <el-dropdown placement="bottom">
          <div class="avatar">
            <img :src="user.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" />
            <div>{{ user.name ||  '管理员' }}</div>
          </div>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click.native="goToPerson">个人信息</el-dropdown-item>
            <el-dropdown-item @click.native="$router.push('/password')">修改密码</el-dropdown-item>
            <el-dropdown-item @click.native="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>

    <!--  主体  -->
    <div class="manager-main">
      <!--  侧边栏  -->
      <div class="manager-main-left">
        <el-menu :default-openeds="['info', 'user']" router style="border: none" :default-active="$route.path">
          <el-menu-item index="/">
            <i class="el-icon-s-home"></i>
            <span slot="title">系统首页</span>
          </el-menu-item>
          <el-submenu index="info">
            <template slot="title">
              <i class="el-icon-menu"></i><span>信息管理</span>
            </template>
            <el-menu-item index="/manager/notice" ><i class="el-icon-chat-dot-round"></i>公告信息</el-menu-item>
            <el-menu-item index="/manager/department" v-if="user.role=='ADMIN'"><i class="el-icon-view"></i>部门信息</el-menu-item>
			<el-menu-item index="/manager/staff" v-if="user.role=='ADMIN'"><i class="el-icon-user"></i>员工信息</el-menu-item>
         
          </el-submenu>
		  
		  <el-submenu index="user">
          <template slot="title">
            <i class="el-icon-s-goods"></i>
            <span>资产管理</span>
          </template> 
		 <!-- <el-menu-item index="/category" v-if="user.role=='ADMIN'" >资产分类</el-menu-item> -->
		  <el-menu-item index="/manager/category" v-if="user.role=='ADMIN'">
		    <i class="el-icon-aim"></i>
		    <span>资产分类</span>
		  </el-menu-item>
          <el-menu-item index="/manager/assets">
            <i class="el-icon-document"></i>
            <span>固定资产</span>
          </el-menu-item>
          <el-menu-item index="/manager/assetsIn">
            <i class="el-icon-plus"></i>
            <span>资产入库</span>
          </el-menu-item>
          <el-menu-item index="/manager/assetsReceive">
            <i class="el-icon-download"></i>
            <span>资产领用</span>
          </el-menu-item>
		  <el-menu-item index="/manager/staffAssets">
		    <i class="el-icon-user"></i>
		    <span>个人资产</span>
		  </el-menu-item>
          <el-menu-item index="/manager/assetsRepair">
            <i class="el-icon-edit"></i>
            <span>资产维修</span>
          </el-menu-item>
          <el-menu-item index="/manager/inventory" v-if="user.role=='ADMIN'">
            <i class="el-icon-search"></i>
            <span>资产盘点</span>
          </el-menu-item>
          <el-menu-item index="/manager/assetsTransfer">
            <i class="el-icon-refresh"></i>
            <span>资产调拨</span>
          </el-menu-item>
        </el-submenu>

          <!-- <el-submenu index="user" v-if="user.role=='ADMIN'">
            <template slot="title">
              <i class="el-icon-menu"></i><span>用户管理</span>
            </template>
            <!-- <el-menu-item index="/admin">管理员信息</el-menu-item> -->
           <!-- <el-menu-item index="/manager/staff"><i class="el-icon-user"></i>员工信息</el-menu-item>
          </el-submenu> --> 
          
          <el-submenu index="user" v-if="user.role=='ADMIN'">
          <template slot="title">
            <!-- <i class="el-icon-connection"></i> -->
			<i class="el-icon-setting"></i>
            <span>系统管理</span>
          </template>
          <el-menu-item index="/manager/integration">
            <i class="el-icon-connection"></i>
            <span>集成配置</span>
          </el-menu-item>
          <el-menu-item index="/manager/apiConfig">
            <i class="el-icon-link"></i>
            <span>接口管理</span>
          </el-menu-item>
        </el-submenu>
        </el-menu>
      </div>

      <!--  数据表格  -->
      <div class="manager-main-right">
        <router-view @update:user="updateUser" />
      </div>
    </div>

  </div>
</template>

<script>
export default {
  name: "Manager",
  data() {
    return {
      user: JSON.parse(localStorage.getItem('xm-user') || '{}'),
    }
  },
  created() {
    if (!this.user.id) {
      this.$router.push('/login')
    }
  },
  methods: {
    updateUser() {
      this.user = JSON.parse(localStorage.getItem('xm-user') || '{}')   // 重新获取下用户的最新信息
    },
    goToPerson() {
      if (this.user.role === 'ADMIN') {
        this.$router.push('/manager/staffPerson')
      }else if(this.user.role === 'STAFF') {
        this.$router.push('/manager/staffPerson')
      }
    },
    logout() {
      localStorage.removeItem('xm-user')
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
@import '../assets/css/manager.css';
</style>