<template>
  <div class="inventory-container">
    <!-- 搜索和操作区域 -->
    <div class="operation-area">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="商品名称">
          <el-input v-model="searchForm.name" placeholder="请输入商品名称" clearable />
        </el-form-item>
        <el-form-item label="原材料分类">
          <el-select v-model="searchForm.category" placeholder="请选择分类" clearable>
            <el-option label="塑料" value="plastic" />
            <el-option label="橡胶" value="rubber" />
            <el-option label="铝材" value="aluminum" />
            <el-option label="钢材" value="steel" />
            <el-option label="电子元件" value="electronic" />
          </el-select>
        </el-form-item>
        <el-form-item label="库存状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="正常" value="normal" />
            <el-option label="预警" value="warning" />
            <el-option label="缺货" value="outOfStock" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
      
      <div class="operation-buttons">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>添加原材料
        </el-button>
        <el-button type="success" @click="handleImport">
          <el-icon><Upload /></el-icon>导入
        </el-button>
        <el-button type="info" @click="handleExport">
          <el-icon><Download /></el-icon>导出
        </el-button>
      </div>
    </div>
    
    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table
        :data="tableData"
        style="width: 100%"
        border
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="原材料编号" width="100" />
        <el-table-column prop="name" label="原材料名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="category" label="分类" width="100" />
        <el-table-column prop="price" label="单价(元/千克)" width="120">
          <template #default="scope">
            ¥{{ scope.row.price.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存重量(千克)" width="120" sortable />
        <el-table-column prop="threshold" label="预警阈值(千克)" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastUpdate" label="最后更新" width="180" sortable />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="success" link @click="handleAddStock(scope.row)">入库</el-button>
            <el-button type="warning" link @click="handleReduceStock(scope.row)">出库</el-button>
            <el-button type="danger" link @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 添加/编辑商品对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加原材料' : '编辑原材料'"
      width="500px"
    >
      <el-form :model="formData" label-width="100px" :rules="rules" ref="formRef">
        <el-form-item label="原材料名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入原材料名称" />
        </el-form-item>
        <el-form-item label="原材料分类" prop="category">
          <el-select v-model="formData.category" placeholder="请选择分类" style="width: 100%">
            <el-option label="塑料" value="plastic" />
            <el-option label="橡胶" value="rubber" />
            <el-option label="铝材" value="aluminum" />
            <el-option label="钢材" value="steel" />
            <el-option label="电子元件" value="electronic" />
          </el-select>
        </el-form-item>
        <el-form-item label="单价(元/千克)" prop="price">
          <el-input-number v-model="formData.price" :precision="2" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="库存重量(千克)" prop="stock">
          <el-input-number v-model="formData.stock" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="预警阈值(千克)" prop="threshold">
          <el-input-number v-model="formData.threshold" :min="0" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 入库/出库对话框 -->
    <el-dialog
      v-model="stockDialogVisible"
      :title="stockDialogType === 'in' ? '原材料入库' : '原材料出库'"
      width="400px"
    >
      <el-form :model="stockForm" label-width="100px" :rules="stockRules" ref="stockFormRef">
        <el-form-item label="原材料名称">
          <span>{{ stockForm.name }}</span>
        </el-form-item>
        <el-form-item label="当前库存(千克)">
          <span>{{ stockForm.currentStock }}</span>
        </el-form-item>
        <el-form-item :label="stockDialogType === 'in' ? '入库重量(千克)' : '出库重量(千克)'" prop="quantity">
          <el-input-number v-model="stockForm.quantity" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="stockForm.remark" type="textarea" :rows="2" placeholder="请输入备注信息" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="stockDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitStockForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Upload, Download } from '@element-plus/icons-vue'

// 搜索表单
const searchForm = reactive({
  name: '',
  category: '',
  status: ''
})

// 表格数据
const tableData = ref([
  {
    id: 'M001',
    name: 'ABS高抗冲塑料颗粒',
    category: '塑料',
    price: 25.50,
    stock: 1200.5,
    threshold: 500.0,
    status: 'normal',
    lastUpdate: '2023-06-15 10:23:45'
  },
  {
    id: 'M002',
    name: 'PP聚丙烯塑料板材',
    category: '塑料',
    price: 18.75,
    stock: 450.0,
    threshold: 500.0,
    status: 'warning',
    lastUpdate: '2023-06-14 16:42:30'
  },
  {
    id: 'M003',
    name: 'EPDM三元乙丙橡胶',
    category: '橡胶',
    price: 32.80,
    stock: 850.0,
    threshold: 400.0,
    status: 'normal',
    lastUpdate: '2023-06-13 09:15:22'
  },
  {
    id: 'M004',
    name: '丁腈橡胶密封圈材料',
    category: '橡胶',
    price: 45.60,
    stock: 320.0,
    threshold: 350.0,
    status: 'warning',
    lastUpdate: '2023-06-12 14:35:18'
  },
  {
    id: 'M005',
    name: '6063铝合金型材',
    category: '铝材',
    price: 28.90,
    stock: 0.0,
    threshold: 200.0,
    status: 'outOfStock',
    lastUpdate: '2023-06-11 11:28:36'
  },
  {
    id: 'M006',
    name: '1060纯铝板',
    category: '铝材',
    price: 22.50,
    stock: 680.0,
    threshold: 300.0,
    status: 'normal',
    lastUpdate: '2023-06-10 15:47:52'
  },
  {
    id: 'M007',
    name: '304不锈钢板',
    category: '钢材',
    price: 35.20,
    stock: 180.0,
    threshold: 200.0,
    status: 'warning',
    lastUpdate: '2023-06-09 10:12:45'
  },
  {
    id: 'M008',
    name: '碳钢冲压件',
    category: '钢材',
    price: 15.80,
    stock: 950.0,
    threshold: 400.0,
    status: 'normal',
    lastUpdate: '2023-06-08 16:23:19'
  },
  {
    id: 'M009',
    name: '温度传感器元件',
    category: '电子元件',
    price: 68.00,
    stock: 520.0,
    threshold: 300.0,
    status: 'normal',
    lastUpdate: '2023-06-07 09:34:27'
  },
  {
    id: 'M010',
    name: '压力控制开关',
    category: '电子元件',
    price: 85.50,
    stock: 420.0,
    threshold: 250.0,
    status: 'normal',
    lastUpdate: '2023-06-06 14:56:38'
  }
])

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

// 加载状态
const loading = ref(false)

// 选中的行
const multipleSelection = ref([])

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref('add') // 'add' 或 'edit'
const formRef = ref(null)
const formData = reactive({
  id: '',
  name: '',
  category: '',
  price: 0,
  stock: 0,
  threshold: 0
})

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择商品分类', trigger: 'change' }],
  price: [{ required: true, message: '请输入商品单价', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入库存数量', trigger: 'blur' }],
  threshold: [{ required: true, message: '请输入预警阈值', trigger: 'blur' }]
}

// 入库/出库对话框相关
const stockDialogVisible = ref(false)
const stockDialogType = ref('in') // 'in' 或 'out'
const stockFormRef = ref(null)
const stockForm = reactive({
  id: '',
  name: '',
  currentStock: 0,
  quantity: 1,
  remark: ''
})

// 入库/出库表单验证规则
const stockRules = {
  quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }]
}

// 获取状态类型
const getStatusType = (status) => {
  switch (status) {
    case 'normal':
      return 'success'
    case 'warning':
      return 'warning'
    case 'outOfStock':
      return 'danger'
    default:
      return 'info'
  }
}

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 'normal':
      return '正常'
    case 'warning':
      return '预警'
    case 'outOfStock':
      return '缺货'
    default:
      return '未知'
  }
}

// 搜索
const handleSearch = () => {
  loading.value = true
  // 实际项目中应该调用API进行搜索
  setTimeout(() => {
    loading.value = false
    ElMessage.success('搜索成功')
  }, 500)
}

// 重置搜索
const resetSearch = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  handleSearch()
}

// 添加商品
const handleAdd = () => {
  dialogType.value = 'add'
  Object.keys(formData).forEach(key => {
    formData[key] = key === 'price' || key === 'stock' || key === 'threshold' ? 0 : ''
  })
  dialogVisible.value = true
}

// 编辑商品
const handleEdit = (row) => {
  dialogType.value = 'edit'
  Object.keys(formData).forEach(key => {
    formData[key] = row[key]
  })
  dialogVisible.value = true
}

// 提交表单
const submitForm = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      // 实际项目中应该调用API进行添加或编辑
      setTimeout(() => {
        dialogVisible.value = false
        ElMessage.success(dialogType.value === 'add' ? '添加成功' : '编辑成功')
      }, 500)
    }
  })
}

// 入库
const handleAddStock = (row) => {
  stockDialogType.value = 'in'
  stockForm.id = row.id
  stockForm.name = row.name
  stockForm.currentStock = row.stock
  stockForm.quantity = 1
  stockForm.remark = ''
  stockDialogVisible.value = true
}

// 出库
const handleReduceStock = (row) => {
  stockDialogType.value = 'out'
  stockForm.id = row.id
  stockForm.name = row.name
  stockForm.currentStock = row.stock
  stockForm.quantity = 1
  stockForm.remark = ''
  stockDialogVisible.value = true
}

// 提交入库/出库表单
const submitStockForm = () => {
  stockFormRef.value.validate((valid) => {
    if (valid) {
      // 实际项目中应该调用API进行入库或出库
      setTimeout(() => {
        stockDialogVisible.value = false
        ElMessage.success(stockDialogType.value === 'in' ? '入库成功' : '出库成功')
      }, 500)
    }
  })
}

// 删除商品
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除商品 ${row.name} 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // 实际项目中应该调用API进行删除
    setTimeout(() => {
      ElMessage.success('删除成功')
    }, 500)
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 导入
const handleImport = () => {
  ElMessage.info('导入功能开发中...')
}

// 导出
const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}

// 表格选择变化
const handleSelectionChange = (selection) => {
  multipleSelection.value = selection
}

// 分页大小变化
const handleSizeChange = (val) => {
  pageSize.value = val
  // 实际项目中应该重新加载数据
}

// 当前页变化
const handleCurrentChange = (val) => {
  currentPage.value = val
  // 实际项目中应该重新加载数据
}
</script>

<style scoped>
.inventory-container {
  padding: 20px;
  width: 100%;
}

.operation-area {
  margin-bottom: 20px;
  background: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.search-form {
  margin-bottom: 20px;
}

.operation-buttons {
  display: flex;
  gap: 10px;
}

.table-card {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>