<template>
  <div class="inventory-container">
    <!-- 搜索区域 -->
    <div class="search-area">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="资产名称">
          <el-input v-model="searchForm.assetsName" placeholder="请输入资产名称" clearable></el-input>
        </el-form-item>
        <el-form-item label="盘点结果">
          <el-select v-model="searchForm.result" placeholder="请选择盘点结果" clearable>
            <el-option label="正常" value="正常"></el-option>
            <el-option label="异常" value="异常"></el-option>
            <el-option label="丢失" value="丢失"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="盘点状态">
          <el-select v-model="searchForm.status" placeholder="请选择盘点状态" clearable>
            <el-option label="待盘点" value="待盘点"></el-option>
            <el-option label="已盘点" value="已盘点"></el-option>
            <el-option label="已确认" value="已确认"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作按钮区域 -->
    <div class="action-area">
      <el-button type="primary" @click="showAddDialog">新增盘点</el-button>
      <el-button type="success" @click="exportData">导出数据</el-button>
      <el-button type="warning" @click="downloadTemplate">下载模板</el-button>
      <el-upload
        class="upload-btn"
        :action="uploadUrl"
        :headers="uploadHeaders"
        :on-success="handleUploadSuccess"
        :on-error="handleUploadError"
        :show-file-list="false"
      >
        <el-button type="info">批量导入</el-button>
      </el-upload>
    </div>

    <!-- 数据表格 -->
    <div class="table-area">
      <el-table :data="tableData" border stripe style="width: 100%">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" label="ID" width="80" align="center"></el-table-column>
        <el-table-column prop="assetsName" label="资产名称" min-width="120" align="center"></el-table-column>
        <el-table-column prop="assetsNo" label="资产编号" min-width="120" align="center"></el-table-column>
        <el-table-column prop="inventoryTime" label="盘点时间" min-width="150" align="center"></el-table-column>
        <el-table-column prop="staffName" label="盘点人" min-width="100" align="center"></el-table-column>
        <el-table-column prop="result" label="盘点结果" min-width="100" align="center">
          <template v-slot="scope">
            <el-tag :type="getResultTagType(scope.row.result)" size="mini">
              {{ scope.row.result }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="盘点状态" min-width="100" align="center">
          <template v-slot="scope">
            <el-tag :type="getStatusTagType(scope.row.status)" size="mini">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="location" label="盘点位置" min-width="120" align="center"></el-table-column>
        <el-table-column prop="comment" label="备注" min-width="150" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template v-slot="scope">
            <el-button size="mini" type="primary" @click="showEditDialog(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="deleteItem(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="pagination-area">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pagination.pageNum"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pagination.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total">
      </el-pagination>
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="600px">
      <el-form :model="form" :rules="rules" ref="form" label-width="100px">
        <el-form-item label="选择资产" prop="assetsId">
          <el-select 
            v-model="form.assetsId" 
            placeholder="请选择要盘点的资产"
            filterable
            remote
            :remote-method="searchAssets"
            :loading="assetsLoading"
            @change="onAssetChange"
            style="width: 100%">
            <el-option
              v-for="item in assetsOptions"
              :key="item.id"
              :label="item.name + ' (' + item.no + ')'"
              :value="item.id">
              <span style="float: left">{{ item.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{ item.no }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="资产名称" prop="assetsName">
          <el-input v-model="form.assetsName" placeholder="资产名称" disabled></el-input>
        </el-form-item>
        <el-form-item label="资产编号" prop="assetsNo">
          <el-input v-model="form.assetsNo" placeholder="资产编号" disabled></el-input>
        </el-form-item>
        <el-form-item label="盘点时间" prop="inventoryTime">
          <el-date-picker
            v-model="form.inventoryTime"
            type="datetime"
            placeholder="选择盘点时间"
            format="yyyy-MM-dd HH:mm:ss"
            value-format="yyyy-MM-dd HH:mm:ss"
            style="width: 100%">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="盘点结果" prop="result">
          <el-select v-model="form.result" placeholder="请选择盘点结果" style="width: 100%">
            <el-option label="正常" value="正常"></el-option>
            <el-option label="异常" value="异常"></el-option>
            <el-option label="丢失" value="丢失"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="盘点状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择盘点状态" style="width: 100%">
            <el-option label="待盘点" value="待盘点"></el-option>
            <el-option label="已盘点" value="已盘点"></el-option>
            <el-option label="已确认" value="已确认"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="盘点位置" prop="location">
          <el-input v-model="form.location" placeholder="请输入盘点位置"></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="comment">
          <el-input type="textarea" v-model="form.comment" placeholder="请输入备注" :rows="3"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Inventory',
  data() {
    return {
      searchForm: {
        assetsName: '',
        result: '',
        status: ''
      },
      tableData: [],
      pagination: {
        pageNum: 1,
        pageSize: 10,
        total: 0
      },
      dialogVisible: false,
      dialogTitle: '新增盘点',
      form: {
        id: null,
        assetsId: null,
        assetsName: '',
        assetsNo: '',
        inventoryTime: '',
        result: '正常',
        status: '待盘点',
        location: '',
        comment: ''
      },
      rules: {
        assetsId: [
          { required: true, message: '请选择要盘点的资产', trigger: 'change' }
        ],
        inventoryTime: [
          { required: true, message: '请选择盘点时间', trigger: 'change' }
        ],
        result: [
          { required: true, message: '请选择盘点结果', trigger: 'change' }
        ],
        status: [
          { required: true, message: '请选择盘点状态', trigger: 'change' }
        ]
      },
      uploadUrl: this.$baseUrl + '/inventory/import',
      uploadHeaders: {
        'token': localStorage.getItem('xm-token')
      },
      assetsOptions: [],
      assetsLoading: false
    }
  },
  created() {
    this.loadData()
  },
  methods: {
    // 加载数据
    async loadData() {
      try {
        const params = {
          pageNum: this.pagination.pageNum,
          pageSize: this.pagination.pageSize,
          ...this.searchForm
        }
        
        const res = await this.$request.get('/inventory/selectPage', { params })
        if (res.code === '200') {
          this.tableData = res.data.list
          this.pagination.total = res.data.total
        }
      } catch (error) {
        console.error('加载数据失败:', error)
        this.$message.error('数据加载失败')
      }
    },

    // 重置搜索
    resetSearch() {
      this.searchForm = {
        assetsName: '',
        result: '',
        status: ''
      }
      this.loadData()
    },

    // 显示新增对话框
    showAddDialog() {
      this.dialogTitle = '新增盘点'
      this.form = {
        id: null,
        assetsId: null,
        assetsName: '',
        assetsNo: '',
        inventoryTime: '',
        result: '正常',
        status: '待盘点',
        location: '',
        comment: ''
      }
      this.dialogVisible = true
    },

    // 显示编辑对话框
    showEditDialog(row) {
      this.dialogTitle = '编辑盘点'
      this.form = { ...row }
      this.dialogVisible = true
    },

    // 搜索资产
    async searchAssets(query) {
      if (query !== '') {
        this.assetsLoading = true
        try {
          const res = await this.$request.get('/assets/selectAll', {
            params: { name: query }
          })
          if (res.code === '200') {
            this.assetsOptions = res.data || []
          }
        } catch (error) {
          console.error('搜索资产失败:', error)
        }
        this.assetsLoading = false
      } else {
        this.assetsOptions = []
      }
    },

    // 资产选择改变
    onAssetChange(assetsId) {
      const selectedAsset = this.assetsOptions.find(item => item.id === assetsId)
      if (selectedAsset) {
        this.form.assetsName = selectedAsset.name
        this.form.assetsNo = selectedAsset.no
      }
    },

    // 提交表单
    async submitForm() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          try {
            if (this.form.id) {
              // 编辑
              await this.$request.put('/inventory/update', this.form)
              this.$message.success('更新成功')
            } else {
              // 新增
              await this.$request.post('/inventory/add', this.form)
              this.$message.success('新增成功')
            }
            this.dialogVisible = false
            this.loadData()
          } catch (error) {
            console.error('提交失败:', error)
            this.$message.error('操作失败')
          }
        }
      })
    },

    // 删除项目
    async deleteItem(id) {
      try {
        await this.$confirm('确定要删除这条记录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        await this.$request.delete(`/inventory/delete/${id}`)
        this.$message.success('删除成功')
        this.loadData()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除失败:', error)
          this.$message.error('删除失败')
        }
      }
    },

    // 导出数据
    exportData() {
      window.open(this.$baseUrl + '/inventory/export', '_blank')
    },

    // 下载模板
    downloadTemplate() {
      window.open(this.$baseUrl + '/inventory/template', '_blank')
    },

    // 上传成功回调
    handleUploadSuccess(response) {
      if (response.code === '200') {
        this.$message.success(response.data)
        this.loadData()
      } else {
        this.$message.error(response.message || '导入失败')
      }
    },

    // 上传失败回调
    handleUploadError() {
      this.$message.error('导入失败')
    },

    // 分页大小改变
    handleSizeChange(val) {
      this.pagination.pageSize = val
      this.loadData()
    },

    // 当前页改变
    handleCurrentChange(val) {
      this.pagination.pageNum = val
      this.loadData()
    },

    // 获取结果标签类型
    getResultTagType(result) {
      switch (result) {
        case '正常': return 'success'
        case '异常': return 'warning'
        case '丢失': return 'danger'
        default: return ''
      }
    },

    // 获取状态标签类型
    getStatusTagType(status) {
      switch (status) {
        case '已确认': return 'success'
        case '已盘点': return 'warning'
        case '待盘点': return 'info'
        default: return ''
      }
    }
  }
}
</script>

<style scoped>
.inventory-container {
  padding: 20px;
}

.search-area {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.action-area {
  background: white;
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.action-area .el-button {
  margin-right: 10px;
}

.upload-btn {
  display: inline-block;
}

.table-area {
  background: white;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.pagination-area {
  background: white;
  padding: 15px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  text-align: center;
}

.dialog-footer {
  text-align: right;
}
</style> 