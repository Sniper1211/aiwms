<template>
  <div class="alerts-container">
    <!-- 搜索和操作区域 -->
    <div class="operation-area">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="原材料名称">
          <el-input v-model="searchForm.name" placeholder="请输入原材料名称" clearable />
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
        <el-form-item label="预警类型">
          <el-select v-model="searchForm.type" placeholder="请选择预警类型" clearable>
            <el-option label="库存不足" value="lowStock" />
            <el-option label="即将过期" value="nearExpiry" />
            <el-option label="滞销原材料" value="slowMoving" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="未处理" value="pending" />
            <el-option label="已处理" value="processed" />
            <el-option label="已忽略" value="ignored" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
      
      <div class="operation-buttons">
        <el-button type="primary" @click="handleBatchProcess" :disabled="!(multipleSelection?.length ?? false)">
          <el-icon><Check /></el-icon>批量处理
        </el-button>
        <el-button type="info" @click="handleBatchIgnore" :disabled="!(multipleSelection?.length ?? false)">
          <el-icon><Close /></el-icon>批量忽略
        </el-button>
        <el-button type="success" @click="handleExport">
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
        <el-table-column prop="id" label="预警ID" width="100" />
        <el-table-column prop="product" label="商品名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="type" label="预警类型" width="120">
          <template #default="scope">
            <el-tag :type="getAlertTypeTag(scope.row.type)">
              {{ scope.row.type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="current" label="当前库存" width="100" />
        <el-table-column prop="threshold" label="预警阈值" width="100" />
        <el-table-column prop="createTime" label="预警时间" width="180" sortable />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="processTime" label="处理时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button 
              v-if="scope.row.status === 'pending'"
              type="primary" 
              link 
              @click="handleProcess(scope.row)"
            >处理</el-button>
            <el-button 
              v-if="scope.row.status === 'pending'"
              type="info" 
              link 
              @click="handleIgnore(scope.row)"
            >忽略</el-button>
            <el-button 
              v-if="scope.row.status !== 'pending'"
              type="success" 
              link 
              @click="handleRestore(scope.row)"
            >恢复</el-button>
            <el-button type="primary" link @click="handleDetail(scope.row)">详情</el-button>
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
    
    <!-- 处理预警对话框 -->
    <el-dialog
      v-model="processDialogVisible"
      title="处理预警"
      width="500px"
    >
      <el-form :model="processForm" label-width="100px" :rules="processRules" ref="processFormRef">
        <el-form-item label="预警ID">
          <span>{{ processForm.id }}</span>
        </el-form-item>
        <el-form-item label="商品名称">
          <span>{{ processForm.product }}</span>
        </el-form-item>
        <el-form-item label="预警类型">
          <span>{{ processForm.type }}</span>
        </el-form-item>
        <el-form-item label="处理方式" prop="action">
          <el-select v-model="processForm.action" placeholder="请选择处理方式" style="width: 100%">
            <el-option label="补充库存" value="replenish" />
            <el-option label="调整阈值" value="adjustThreshold" />
            <el-option label="促销处理" value="promotion" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理备注" prop="remark">
          <el-input v-model="processForm.remark" type="textarea" :rows="3" placeholder="请输入处理备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="processDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitProcessForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 预警详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="预警详情"
      width="600px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="预警ID">{{ detailData.id }}</el-descriptions-item>
        <el-descriptions-item label="商品名称">{{ detailData.product }}</el-descriptions-item>
        <el-descriptions-item label="预警类型">
          <el-tag :type="getAlertTypeTag(detailData.type)">{{ detailData.type }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="当前状态">
          <el-tag :type="getStatusType(detailData.status)">{{ getStatusText(detailData.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="当前库存">{{ detailData.current }}</el-descriptions-item>
        <el-descriptions-item label="预警阈值">{{ detailData.threshold }}</el-descriptions-item>
        <el-descriptions-item label="预警时间">{{ detailData.createTime }}</el-descriptions-item>
        <el-descriptions-item label="处理时间">{{ detailData.processTime || '未处理' }}</el-descriptions-item>
        <el-descriptions-item label="处理方式" :span="2">{{ detailData.action || '未处理' }}</el-descriptions-item>
        <el-descriptions-item label="处理备注" :span="2">{{ detailData.remark || '无' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <el-button 
            v-if="detailData.status === 'pending'"
            type="primary" 
            @click="handleProcessFromDetail"
          >处理</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Check, Close, Download } from '@element-plus/icons-vue'
import axios from 'axios'

// 搜索表单
const searchForm = reactive({
  name: '',
  type: '',
  status: ''
})

// 表格数据
const tableData = ref([])
const total = ref(0)
const loading = ref(false)

// 获取预警数据
const fetchAlerts = async () => {
  try {
    loading.value = true
    const response = await axios.get('/api/alerts', {
      params: {
        ...searchForm,
        page: currentPage.value,
        pageSize: pageSize.value
      }
    })
    tableData.value = response.data.items
    total.value = response.data.total
  } catch (error) {
    ElMessage.error('获取预警数据失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchAlerts()
}

// 重置搜索
const resetSearch = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  handleSearch()
}

// 处理预警
const handleProcess = (row) => {
  processForm.id = row.id
  processForm.product = row.product
  processForm.type = row.type
  processForm.action = ''
  processForm.remark = ''
  processDialogVisible.value = true
}

// 从详情处理预警
const handleProcessFromDetail = () => {
  detailDialogVisible.value = false
  processForm.id = detailData.id
  processForm.product = detailData.product
  processForm.type = detailData.type
  processForm.action = ''
  processForm.remark = ''
  processDialogVisible.value = true
}

// 提交处理表单
const submitProcessForm = async () => {
  try {
    await processFormRef.value.validate()
    await axios.put(`/api/alerts/${processForm.id}`, {
      status: 'processed',
      action: processForm.action,
      remark: processForm.remark,
      processTime: new Date().toISOString()
    })
    ElMessage.success('处理成功')
    processDialogVisible.value = false
    fetchAlerts()
  } catch (error) {
    if (!error.response) ElMessage.error('处理失败')
  }
}

// 忽略预警
const handleIgnore = async (row) => {
  ElMessageBox.confirm(
    `确定要忽略预警 ${row.id} 吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // 实际项目中应该调用API进行忽略
    setTimeout(() => {
      ElMessage.success('已忽略预警')
      
      // 更新表格数据（实际项目中应该重新加载数据）
      const index = tableData.value.findIndex(item => item.id === row.id)
      if (index !== -1) {
        tableData.value[index].status = 'ignored'
        tableData.value[index].processTime = new Date().toLocaleString()
        tableData.value[index].action = '忽略'
      }
    }, 500)
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

// 恢复预警
const handleRestore = async (row) => {
  ElMessageBox.confirm(
    `确定要恢复预警 ${row.id} 吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // 实际项目中应该调用API进行恢复
    setTimeout(() => {
      ElMessage.success('已恢复预警')
      
      // 更新表格数据（实际项目中应该重新加载数据）
      const index = tableData.value.findIndex(item => item.id === row.id)
      if (index !== -1) {
        tableData.value[index].status = 'pending'
        tableData.value[index].processTime = ''
        tableData.value[index].action = ''
        tableData.value[index].remark = ''
      }
    }, 500)
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

// 查看详情
const handleDetail = (row) => {
  Object.keys(detailData).forEach(key => {
    detailData[key] = row[key]
  })
  detailDialogVisible.value = true
}

// 批量处理
const handleBatchProcess = () => {
  if (multipleSelection.value.length === 0) {
    ElMessage.warning('请选择要处理的预警')
    return
  }
  
  const pendingAlerts = multipleSelection.value.filter(item => item.status === 'pending')
  if (pendingAlerts.length === 0) {
    ElMessage.warning('所选预警中没有未处理的预警')
    return
  }
  
  ElMessageBox.confirm(
    `确定要批量处理 ${pendingAlerts.length} 条预警吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // 实际项目中应该调用API进行批量处理
    setTimeout(() => {
      ElMessage.success(`已处理 ${pendingAlerts.length} 条预警`)
      
      // 更新表格数据（实际项目中应该重新加载数据）
      pendingAlerts.forEach(alert => {
        const index = tableData.value.findIndex(item => item.id === alert.id)
        if (index !== -1) {
          tableData.value[index].status = 'processed'
          tableData.value[index].processTime = new Date().toLocaleString()
          tableData.value[index].action = '批量处理'
          tableData.value[index].remark = '系统批量处理'
        }
      })
    }, 500)
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

// 批量忽略
const handleBatchIgnore = () => {
  if (multipleSelection.value.length === 0) {
    ElMessage.warning('请选择要忽略的预警')
    return
  }
  
  const pendingAlerts = multipleSelection.value.filter(item => item.status === 'pending')
  if (pendingAlerts.length === 0) {
    ElMessage.warning('所选预警中没有未处理的预警')
    return
  }
  
  ElMessageBox.confirm(
    `确定要批量忽略 ${pendingAlerts.length} 条预警吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // 实际项目中应该调用API进行批量忽略
    setTimeout(() => {
      ElMessage.success(`已忽略 ${pendingAlerts.length} 条预警`)
      
      // 更新表格数据（实际项目中应该重新加载数据）
      pendingAlerts.forEach(alert => {
        const index = tableData.value.findIndex(item => item.id === alert.id)
        if (index !== -1) {
          tableData.value[index].status = 'ignored'
          tableData.value[index].processTime = new Date().toLocaleString()
          tableData.value[index].action = '批量忽略'
          tableData.value[index].remark = '系统批量忽略'
        }
      })
    }, 500)
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

// 导出
const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}

// 表格选择变化
const handleSelectionChange = (selection) => {
  multipleSelection.value = selection || []
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
.alerts-container {
  padding: 10px;
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
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

// 初始化加载数据
onMounted(() => {
  fetchAlerts()
})