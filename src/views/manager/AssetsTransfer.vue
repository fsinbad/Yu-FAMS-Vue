<template>
  <div class="assets-transfer-container">
    <div class="search-area">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="资产名称">
          <el-input v-model="searchForm.assetsName" placeholder="请输入资产名称" clearable></el-input>
        </el-form-item>
        <el-form-item label="调拨状态">
          <el-select v-model="searchForm.status" placeholder="请选择调拨状态" clearable>
            <el-option label="待审批" value="待审批"></el-option>
            <el-option label="已审批" value="已审批"></el-option>
            <el-option label="已调拨" value="已调拨"></el-option>
            <el-option label="已拒绝" value="已拒绝"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="action-area">
      <el-button type="primary" @click="showAddDialog">新增调拨</el-button>
      <el-button type="success" @click="exportData">导出数据</el-button>
    </div>

    <div class="table-area">
      <el-table :data="tableData" border stripe>
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="assetsName" label="资产名称"></el-table-column>
        <el-table-column prop="assetsNo" label="资产编号"></el-table-column>
		
		<el-table-column prop="fromStaffName" label="原使用人"></el-table-column>
		<el-table-column prop="fromDepartmentName" label="原使用部门"></el-table-column>
		<el-table-column prop="toStaffName" label="现使用人"></el-table-column>
		<el-table-column prop="toDepartmentName" label="现使用部门"></el-table-column>
		<el-table-column prop="reason" label="调拨原因"></el-table-column>
		
        <el-table-column prop="transferTime" label="调拨时间"></el-table-column>
        <el-table-column prop="transferStaffName" label="调拨人"></el-table-column>
        <el-table-column prop="status" label="调拨状态">
          <template v-slot="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
		<el-table-column prop="approverName" label="审批人"></el-table-column>
		<el-table-column prop="approveTime" label="审批时间"></el-table-column>
        <el-table-column label="操作" width="220">
          <template v-slot="scope">
            <el-button size="mini" type="primary" @click="showEditDialog(scope.row)">编辑</el-button>
            <el-button size="mini" type="success" @click="showApproveDialog(scope.row)" v-if="scope.row.status === '待审批'">审批</el-button>
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
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="600px">
      <el-form :model="form" :rules="rules" ref="form" label-width="100px">
        <el-form-item label="资产" prop="assetsId">
          <el-select v-model="form.assetsId" placeholder="请选择资产" filterable @change="handleAssetChange">
            <el-option 
              v-for="item in assetsList" 
              :key="item.id" 
              :label="item.name + ' (' + item.no + ')'" 
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        
        <!-- 显示当前资产信息 -->
        <div v-if="selectedAsset" style="margin-bottom: 20px; padding: 10px; background-color: #f5f7fa; border-radius: 4px;">
          <div><strong>当前使用人：</strong>{{ selectedAsset.staffName || '无' }}</div>
          <div><strong>当前使用部门：</strong>{{ selectedAsset.departmentName || '无' }}</div>
        </div>
        
        <el-form-item label="调拨时间" prop="transferTime">
          <el-date-picker v-model="form.transferTime" type="datetime" placeholder="选择调拨时间"></el-date-picker>
        </el-form-item>
        
        <el-form-item label="新使用部门" prop="toDepartmentId">
          <el-select ref="departmentSelect" v-model="form.toDepartmentId" placeholder="请选择新使用部门" filterable style="width: 100%;">
            <el-option
                v-for="item in departmentList"
                :key="item.id"
                :value="item.id"
                :label="item.name">
            </el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="新使用人" prop="toStaffId">
          <el-select v-model="form.toStaffId" placeholder="请选择新使用人" filterable>
            <el-option 
              v-for="item in staffList" 
              :key="item.id" 
              :label="item.name" 
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="调拨原因" prop="reason">
          <el-input type="textarea" v-model="form.reason" placeholder="请输入调拨原因" :rows="3"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 审批对话框 -->
    <el-dialog title="审批调拨申请" :visible.sync="approveDialogVisible" width="500px">
      <el-form :model="approveForm" ref="approveForm" label-width="100px">
        <el-form-item label="审批结果">
          <el-radio-group v-model="approveForm.status">
            <el-radio label="已审批">同意</el-radio>
            <el-radio label="已拒绝">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审批意见">
          <el-input type="textarea" v-model="approveForm.approveComment" placeholder="请输入审批意见"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="approveDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitApprove">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'AssetsTransfer',
  data() {
    return {
      searchForm: {
        assetsName: '',
        status: ''
      },
      tableData: [],
      pagination: {
        pageNum: 1,
        pageSize: 10,
        total: 0
      },
      dialogVisible: false,
      dialogTitle: '新增调拨',
      assetsList: [], // 可调拨的资产列表
      departmentList: [], // 部门列表
      staffList: [], // 员工列表
      selectedAsset: null, // 当前选中的资产
      form: {
        id: null,
        assetsId: null,
        transferTime: '',
        fromStaffId: null, // 原使用人ID
        fromDepartmentId: null, // 原使用部门ID
        toStaffId: null, // 新使用人ID
        toDepartmentId: null, // 新使用部门ID
        reason: ''
      },
      rules: {
        assetsId: [{ required: true, message: '请选择资产', trigger: 'change' }],
        transferTime: [{ required: true, message: '请选择调拨时间', trigger: 'change' }],
        toDepartmentId: [{ required: true, message: '请选择新使用部门', trigger: 'change' }],
        toStaffId: [{ required: true, message: '请选择新使用人', trigger: 'change' }],
        reason: [{ required: true, message: '请输入调拨原因', trigger: 'blur' }]
      },
      approveDialogVisible: false,
      approveForm: {
        id: null,
        status: '已审批',
        approveComment: ''
      }
    }
  },
  created() {
    this.loadData()
    this.loadAssetsList()
    this.loadDepartmentList()
    this.loadStaffList()
  },
  methods: {
    async loadData() {
      try {
        const params = {
          pageNum: this.pagination.pageNum,
          pageSize: this.pagination.pageSize,
          ...this.searchForm
        }
        const res = await this.$request.get('/assetsTransfer/selectPage', { params })
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
      this.searchForm = { assetsName: '', status: '' }
      this.loadData()
    },

    showAddDialog() {
      this.dialogTitle = '新增调拨'
      this.form = { id: null, assetsId: null, transferTime: '', reason: '' }
      this.dialogVisible = true
    },

    showEditDialog(row) {
      this.dialogTitle = '编辑调拨'
      this.form = { ...row }
      this.dialogVisible = true
    },

    showApproveDialog(row) {
      this.approveForm = { id: row.id, status: '已审批', approveComment: '' }
      this.approveDialogVisible = true
    },

    // 加载可调拨的资产列表
    async loadAssetsList() {
      try {
        const res = await this.$request.get('/assets/selectAll')
        if (res.code === '200') {
          this.assetsList = res.data || []
        }
      } catch (error) {
        console.error('加载资产列表失败:', error)
      }
    },
    
    // 加载部门列表
    async loadDepartmentList() {
      try {
        const res = await this.$request.get('/department/selectAll')
        if (res.code === '200') {
          this.departmentList = res.data || []
        }
      } catch (error) {
        console.error('加载部门列表失败:', error)
      }
    },
    
    // 加载员工列表
    async loadStaffList() {
      try {
        const res = await this.$request.get('/staff/selectAll')
        if (res.code === '200') {
          this.staffList = res.data || []
        }
      } catch (error) {
        console.error('加载员工列表失败:', error)
      }
    },
    
    // 选择资产时触发
    handleAssetChange(assetId) {
      const asset = this.assetsList.find(item => item.id === assetId)
      if (asset) {
        this.selectedAsset = asset
        // 自动填充原使用人和部门信息
        this.form.fromStaffId = asset.staffId
        this.form.fromDepartmentId = asset.departmentId
      } else {
        this.selectedAsset = null
        this.form.fromStaffId = null
        this.form.fromDepartmentId = null
      }
    },
    
    // 提交表单时更新
    async submitForm() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          try {
            // 构建完整的调拨数据
            const transferData = {
              ...this.form,
              // 添加原使用人和部门名称，方便显示
              fromStaffName: this.selectedAsset ? this.selectedAsset.staffName : '',
              fromDepartmentName: this.selectedAsset ? this.selectedAsset.departmentName : '',
              // 添加新使用人和部门名称
              toStaffName: this.staffList.find(s => s.id === this.form.toStaffId)?.name || '',
              toDepartmentName: this.departmentList.find(d => d.id === this.form.toDepartmentId)?.name || ''
            }
            
            if (this.form.id) {
              await this.$request.put('/assetsTransfer/update', transferData)
              this.$message.success('更新成功')
            } else {
              await this.$request.post('/assetsTransfer/add', transferData)
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

    async submitApprove() {
      try {
        // 使用params将参数作为URL查询参数传递
        await this.$request.post('/assetsTransfer/approve', null, {
          params: this.approveForm
        })
        this.$message.success('审批成功')
        this.approveDialogVisible = false
        this.loadData()
      } catch (error) {
        console.error('审批失败:', error)
        this.$message.error('审批失败')
      }
    },

    async deleteItem(id) {
      try {
        await this.$confirm('确定要删除这条记录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await this.$request.delete(`/assetsTransfer/delete/${id}`)
        this.$message.success('删除成功')
        this.loadData()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('删除失败')
        }
      }
    },

    exportData() {
      window.open(this.$baseUrl + '/assetsTransfer/export', '_blank')
    },

    handleSizeChange(val) {
      this.pagination.pageSize = val
      this.loadData()
    },

    handleCurrentChange(val) {
      this.pagination.pageNum = val
      this.loadData()
    },

    getStatusTagType(status) {
      switch (status) {
        case '已调拨': return 'success'
        case '已审批': return 'warning'
        case '待审批': return 'info'
        case '已拒绝': return 'danger'
        default: return ''
      }
    }
  }
}
</script>

<style scoped>
.assets-transfer-container {
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