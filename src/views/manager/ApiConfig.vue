<template>
  <div class="api-config-container">
    <div class="search-area">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="接口名称">
          <el-input v-model="searchForm.name" placeholder="请输入接口名称" clearable></el-input>
        </el-form-item>
        <el-form-item label="接口状态">
          <el-select v-model="searchForm.status" placeholder="请选择接口状态" clearable>
            <el-option label="启用" value="启用"></el-option>
            <el-option label="禁用" value="禁用"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="接口类型">
          <el-select v-model="searchForm.type" placeholder="请选择接口类型" clearable>
            <el-option label="内部接口" value="内部接口"></el-option>
            <el-option label="外部接口" value="外部接口"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="action-area">
      <el-button type="primary" @click="showAddDialog">新增接口</el-button>
      <el-button type="success" @click="exportData">导出数据</el-button>
    </div>

    <div class="table-area">
      <el-table :data="tableData" border stripe>
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="name" label="接口名称"></el-table-column>
        <el-table-column prop="description" label="接口描述" show-overflow-tooltip></el-table-column>
        <el-table-column prop="url" label="接口URL" show-overflow-tooltip></el-table-column>
        <el-table-column prop="method" label="请求方法" width="100"></el-table-column>
        <el-table-column prop="status" label="接口状态" width="100">
          <template v-slot="scope">
            <el-tag :type="scope.row.status === '启用' ? 'success' : 'danger'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="接口类型" width="100"></el-table-column>
        <el-table-column prop="authType" label="认证方式" width="100"></el-table-column>
        <el-table-column prop="timeout" label="超时时间" width="100"></el-table-column>
        <el-table-column label="操作" width="220">
          <template v-slot="scope">
            <el-button size="mini" type="primary" @click="showEditDialog(scope.row)">编辑</el-button>
            <el-button size="mini" type="success" @click="testApi(scope.row.id)">测试</el-button>
            <el-button size="mini" type="danger" @click="deleteItem(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pagination.pageNum"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pagination.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="pagination.total">
    </el-pagination>

    <!-- 新增/编辑对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="800px">
      <el-form :model="form" :rules="rules" ref="form" label-width="120px">
        <el-form-item label="接口名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入接口名称"></el-input>
        </el-form-item>
        <el-form-item label="接口描述" prop="description">
          <el-input type="textarea" v-model="form.description" placeholder="请输入接口描述"></el-input>
        </el-form-item>
        <el-form-item label="接口URL" prop="url">
          <el-input v-model="form.url" placeholder="请输入接口URL"></el-input>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="请求方法" prop="method">
              <el-select v-model="form.method" placeholder="请选择请求方法" style="width: 100%">
                <el-option label="GET" value="GET"></el-option>
                <el-option label="POST" value="POST"></el-option>
                <el-option label="PUT" value="PUT"></el-option>
                <el-option label="DELETE" value="DELETE"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="响应格式" prop="responseFormat">
              <el-select v-model="form.responseFormat" placeholder="请选择响应格式" style="width: 100%">
                <el-option label="JSON" value="JSON"></el-option>
                <el-option label="XML" value="XML"></el-option>
                <el-option label="TEXT" value="TEXT"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="接口状态" prop="status">
              <el-select v-model="form.status" placeholder="请选择接口状态" style="width: 100%">
                <el-option label="启用" value="启用"></el-option>
                <el-option label="禁用" value="禁用"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="接口类型" prop="type">
              <el-select v-model="form.type" placeholder="请选择接口类型" style="width: 100%">
                <el-option label="内部接口" value="内部接口"></el-option>
                <el-option label="外部接口" value="外部接口"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="认证方式" prop="authType">
              <el-select v-model="form.authType" placeholder="请选择认证方式" style="width: 100%">
                <el-option label="无认证" value="无认证"></el-option>
                <el-option label="Token" value="Token"></el-option>
                <el-option label="OAuth2" value="OAuth2"></el-option>
                <el-option label="API Key" value="API Key"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="超时时间(秒)" prop="timeout">
              <el-input-number v-model="form.timeout" :min="1" :max="300" style="width: 100%"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="请求头" prop="headers">
          <el-input type="textarea" v-model="form.headers" placeholder="请输入请求头(JSON格式)"></el-input>
        </el-form-item>
        <el-form-item label="请求参数" prop="parameters">
          <el-input type="textarea" v-model="form.parameters" placeholder="请输入请求参数(JSON格式)"></el-input>
        </el-form-item>
        <el-form-item label="认证信息" prop="authInfo">
          <el-input type="textarea" v-model="form.authInfo" placeholder="请输入认证信息(JSON格式)"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 测试结果对话框 -->
    <el-dialog title="接口测试结果" :visible.sync="testDialogVisible" width="600px">
      <div v-if="testResult">
        <el-alert :title="testResult" type="info" show-icon></el-alert>
      </div>
      <div slot="footer">
        <el-button @click="testDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'ApiConfig',
  data() {
    return {
      searchForm: {
        name: '',
        status: '',
        type: ''
      },
      tableData: [],
      pagination: {
        pageNum: 1,
        pageSize: 10,
        total: 0
      },
      dialogVisible: false,
      dialogTitle: '新增接口',
      form: {
        id: null,
        name: '',
        description: '',
        url: '',
        method: 'GET',
        headers: '',
        parameters: '',
        responseFormat: 'JSON',
        status: '启用',
        type: '内部接口',
        authType: '无认证',
        authInfo: '',
        timeout: 30,
        retryCount: 0
      },
      rules: {
        name: [{ required: true, message: '请输入接口名称', trigger: 'blur' }],
        url: [{ required: true, message: '请输入接口URL', trigger: 'blur' }],
        method: [{ required: true, message: '请选择请求方法', trigger: 'change' }],
        status: [{ required: true, message: '请选择接口状态', trigger: 'change' }],
        type: [{ required: true, message: '请选择接口类型', trigger: 'change' }]
      },
      testDialogVisible: false,
      testResult: ''
    }
  },
  created() {
    this.loadData()
  },
  methods: {
    async loadData() {
      try {
        const params = {
          pageNum: this.pagination.pageNum,
          pageSize: this.pagination.pageSize,
          ...this.searchForm
        }
        const res = await this.$request.get('/apiConfig/selectPage', { params })
        if (res.code === '200') {
          this.tableData = res.data.list
          this.pagination.total = res.data.total
        }
      } catch (error) {
        console.error('加载数据失败:', error)
        this.$message.error('数据加载失败')
      }
    },

    resetSearch() {
      this.searchForm = { name: '', status: '', type: '' }
      this.loadData()
    },

    showAddDialog() {
      this.dialogTitle = '新增接口'
      this.form = {
        id: null,
        name: '',
        description: '',
        url: '',
        method: 'GET',
        headers: '',
        parameters: '',
        responseFormat: 'JSON',
        status: '启用',
        type: '内部接口',
        authType: '无认证',
        authInfo: '',
        timeout: 30,
        retryCount: 0
      }
      this.dialogVisible = true
    },

    showEditDialog(row) {
      this.dialogTitle = '编辑接口'
      this.form = { ...row }
      this.dialogVisible = true
    },

    async submitForm() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          try {
            if (this.form.id) {
              await this.$request.put('/apiConfig/update', this.form)
              this.$message.success('更新成功')
            } else {
              await this.$request.post('/apiConfig/add', this.form)
              this.$message.success('新增成功')
            }
            this.dialogVisible = false
            this.loadData()
          } catch (error) {
            this.$message.error('操作失败')
          }
        }
      })
    },

    async testApi(id) {
      try {
        const res = await this.$request.post(`/apiConfig/test/${id}`)
        if (res.code === '200') {
          this.testResult = res.data
          this.testDialogVisible = true
        } else {
          this.$message.error('测试失败')
        }
      } catch (error) {
        this.$message.error('测试失败')
      }
    },

    async deleteItem(id) {
      try {
        await this.$confirm('确定要删除这条记录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await this.$request.delete(`/apiConfig/delete/${id}`)
        this.$message.success('删除成功')
        this.loadData()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('删除失败')
        }
      }
    },

    exportData() {
      window.open(this.$baseUrl + '/apiConfig/export', '_blank')
    },

    handleSizeChange(val) {
      this.pagination.pageSize = val
      this.loadData()
    },

    handleCurrentChange(val) {
      this.pagination.pageNum = val
      this.loadData()
    }
  }
}
</script>

<style scoped>
.api-config-container {
  padding: 20px;
}

.search-area, .action-area, .table-area {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}
</style> 