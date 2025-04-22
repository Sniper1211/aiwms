<template>
  <div class="settings-container">
    <el-card class="settings-card">
      <template #header>
        <div class="card-header">
          <span>系统设置</span>
        </div>
      </template>
      
      <el-tabs v-model="activeTab">
        <!-- 预警规则设置 -->
        <el-tab-pane label="预警规则" name="alertRules">
          <div class="tab-content">
            <div class="section-header">
              <h3>汽车空调系统原材料库存预警规则设置</h3>
              <el-button type="primary" size="small" @click="addAlertRule">
                <el-icon><Plus /></el-icon>添加规则
              </el-button>
            </div>
            
            <el-table :data="alertRules" style="width: 100%" border>
              <el-table-column prop="name" label="规则名称" min-width="150" />
              <el-table-column prop="type" label="预警类型" width="120">
                <template #default="scope">
                  <el-tag :type="getAlertTypeTag(scope.row.type)">
                    {{ scope.row.type }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="condition" label="触发条件" min-width="180" />
              <el-table-column prop="action" label="预警动作" min-width="180" />
              <el-table-column prop="status" label="状态" width="100">
                <template #default="scope">
                  <el-switch
                    v-model="scope.row.status"
                    :active-value="true"
                    :inactive-value="false"
                    @change="handleStatusChange(scope.row)"
                  />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150">
                <template #default="scope">
                  <el-button type="primary" link @click="editAlertRule(scope.row)">编辑</el-button>
                  <el-button type="danger" link @click="deleteAlertRule(scope.row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
        
        <!-- 通知设置 -->
        <el-tab-pane label="通知设置" name="notifications">
          <div class="tab-content">
            <h3>通知方式设置</h3>
            
            <el-form :model="notificationSettings" label-width="120px">
              <el-form-item label="邮件通知">
                <el-switch
                  v-model="notificationSettings.email.enabled"
                  @change="handleNotificationChange('email')"
                />
              </el-form-item>
              
              <div v-if="notificationSettings.email.enabled" class="sub-settings">
                <el-form-item label="接收邮箱">
                  <el-input v-model="notificationSettings.email.recipients" placeholder="多个邮箱用逗号分隔" />
                </el-form-item>
                <el-form-item label="通知频率">
                  <el-select v-model="notificationSettings.email.frequency" style="width: 100%">
                    <el-option label="实时通知" value="realtime" />
                    <el-option label="每日汇总" value="daily" />
                    <el-option label="每周汇总" value="weekly" />
                  </el-select>
                </el-form-item>
              </div>
              
              <el-divider />
              
              <el-form-item label="短信通知">
                <el-switch
                  v-model="notificationSettings.sms.enabled"
                  @change="handleNotificationChange('sms')"
                />
              </el-form-item>
              
              <div v-if="notificationSettings.sms.enabled" class="sub-settings">
                <el-form-item label="接收手机号">
                  <el-input v-model="notificationSettings.sms.recipients" placeholder="多个手机号用逗号分隔" />
                </el-form-item>
                <el-form-item label="通知频率">
                  <el-select v-model="notificationSettings.sms.frequency" style="width: 100%">
                    <el-option label="仅紧急预警" value="emergency" />
                    <el-option label="所有预警" value="all" />
                  </el-select>
                </el-form-item>
              </div>
              
              <el-divider />
              
              <el-form-item label="系统内通知">
                <el-switch
                  v-model="notificationSettings.system.enabled"
                  @change="handleNotificationChange('system')"
                />
              </el-form-item>
              
              <div v-if="notificationSettings.system.enabled" class="sub-settings">
                <el-form-item label="通知类型">
                  <el-checkbox-group v-model="notificationSettings.system.types">
                    <el-checkbox label="库存不足">库存不足</el-checkbox>
                    <el-checkbox label="材料存放超期">材料存放超期</el-checkbox>
                    <el-checkbox label="滞销材料">滞销材料</el-checkbox>
                    <el-checkbox label="材料氧化">材料氧化</el-checkbox>
                  </el-checkbox-group>
                </el-form-item>
              </div>
              
              <el-form-item>
                <el-button type="primary" @click="saveNotificationSettings">保存设置</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
        
        <!-- 系统参数 -->
        <el-tab-pane label="系统参数" name="parameters">
          <div class="tab-content">
            <h3>系统参数设置</h3>
            
            <el-form :model="systemParameters" label-width="180px">
              <el-form-item label="默认库存预警阈值(千克)">
                <el-input-number v-model="systemParameters.defaultStockThreshold" :min="1" />
              </el-form-item>
              
              <el-form-item label="材料存放预警天数">
                <el-input-number v-model="systemParameters.defaultExpiryDays" :min="1" />
              </el-form-item>
              
              <el-form-item label="材料滞销判定天数">
                <el-input-number v-model="systemParameters.slowMovingDays" :min="1" />
              </el-form-item>
              
              <el-form-item label="数据保留天数">
                <el-input-number v-model="systemParameters.dataRetentionDays" :min="30" />
                <div class="form-tip">系统将自动清理超过保留天数的历史数据</div>
              </el-form-item>
              
              <el-divider />
              
              <el-form-item label="自动备份">
                <el-switch v-model="systemParameters.autoBackup" />
              </el-form-item>
              
              <div v-if="systemParameters.autoBackup" class="sub-settings">
                <el-form-item label="备份频率">
                  <el-select v-model="systemParameters.backupFrequency" style="width: 100%">
                    <el-option label="每日备份" value="daily" />
                    <el-option label="每周备份" value="weekly" />
                    <el-option label="每月备份" value="monthly" />
                  </el-select>
                </el-form-item>
                
                <el-form-item label="备份保留数量">
                  <el-input-number v-model="systemParameters.backupRetention" :min="1" :max="30" />
                </el-form-item>
              </div>
              
              <el-form-item>
                <el-button type="primary" @click="saveSystemParameters">保存设置</el-button>
                <el-button type="info" @click="resetSystemParameters">恢复默认</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    
    <!-- 添加/编辑预警规则对话框 -->
    <el-dialog
      v-model="ruleDialogVisible"
      :title="isEdit ? '编辑预警规则' : '添加预警规则'"
      width="500px"
    >
      <el-form :model="ruleForm" label-width="100px" :rules="ruleFormRules" ref="ruleFormRef">
        <el-form-item label="规则名称" prop="name">
          <el-input v-model="ruleForm.name" placeholder="请输入规则名称" />
        </el-form-item>
        
        <el-form-item label="预警类型" prop="type">
          <el-select v-model="ruleForm.type" placeholder="请选择预警类型" style="width: 100%">
            <el-option label="库存不足" value="库存不足" />
            <el-option label="即将过期" value="即将过期" />
            <el-option label="滞销材料" value="滞销商品" />
            <el-option label="材料氧化" value="材料氧化" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="触发条件" prop="condition">
          <el-input v-model="ruleForm.condition" placeholder="请输入触发条件" />
        </el-form-item>
        
        <el-form-item label="预警动作" prop="action">
          <el-select v-model="ruleForm.action" placeholder="请选择预警动作" style="width: 100%">
            <el-option label="系统通知" value="系统通知" />
            <el-option label="邮件通知" value="邮件通知" />
            <el-option label="短信通知" value="短信通知" />
            <el-option label="全部通知" value="全部通知" />
            <el-option label="库存调整提醒" value="库存调整提醒" />
            <el-option label="采购提醒" value="采购提醒" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="状态">
          <el-switch v-model="ruleForm.status" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="ruleDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitRuleForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

// 当前激活的标签页
const activeTab = ref('alertRules')

// 预警规则数据
const alertRules = ref([
  {
    id: 1,
    name: 'ABS塑料库存预警',
    type: '库存不足',
    condition: '当库存重量低于500千克时触发',
    action: '系统通知、邮件通知',
    status: true
  },
  {
    id: 2,
    name: 'EPDM橡胶库存预警',
    type: '库存不足',
    condition: '当库存重量低于300千克时触发',
    action: '系统通知、短信通知',
    status: true
  },
  {
    id: 3,
    name: '铝材氧化预警',
    type: '即将过期',
    condition: '当铝材存放时间超过180天时触发',
    action: '系统通知',
    status: true
  },
  {
    id: 4,
    name: '季节性橡胶材料预警',
    type: '滞销商品',
    condition: '当橡胶材料90天未使用时触发',
    action: '系统通知、邮件通知',
    status: false
  }
])

// 通知设置
const notificationSettings = reactive({
  email: {
    enabled: true,
    recipients: 'admin@example.com,manager@example.com',
    frequency: 'daily'
  },
  sms: {
    enabled: false,
    recipients: '13800138000,13900139000',
    frequency: 'emergency'
  },
  system: {
    enabled: true,
    types: ['库存不足', '材料存放超期', '材料氧化']
  }
})

// 系统参数
const systemParameters = reactive({
  defaultStockThreshold: 300, // 默认库存阈值（千克）
  defaultExpiryDays: 180, // 材料存放时间（天）
  slowMovingDays: 90, // 滞销判定天数
  dataRetentionDays: 365, // 数据保留天数
  autoBackup: true,
  backupFrequency: 'daily',
  backupRetention: 14
})

// 预警规则对话框相关
const ruleDialogVisible = ref(false)
const isEdit = ref(false)
const ruleFormRef = ref(null)
const ruleForm = reactive({
  id: null,
  name: '',
  type: '',
  condition: '',
  action: '',
  status: true
})

// 规则表单验证
const ruleFormRules = {
  name: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择预警类型', trigger: 'change' }],
  condition: [{ required: true, message: '请输入触发条件', trigger: 'blur' }],
  action: [{ required: true, message: '请选择预警动作', trigger: 'change' }]
}

// 获取预警类型标签
const getAlertTypeTag = (type) => {
  switch (type) {
    case '库存不足':
      return 'danger'
    case '即将过期':
      return 'warning'
    case '滞销商品':
      return 'info'
    default:
      return ''
  }
}

// 添加预警规则
const addAlertRule = () => {
  isEdit.value = false
  Object.keys(ruleForm).forEach(key => {
    if (key === 'status') {
      ruleForm[key] = true
    } else if (key === 'id') {
      ruleForm[key] = null
    } else {
      ruleForm[key] = ''
    }
  })
  ruleDialogVisible.value = true
}

// 编辑预警规则
const editAlertRule = (row) => {
  isEdit.value = true
  Object.keys(ruleForm).forEach(key => {
    ruleForm[key] = row[key]
  })
  ruleDialogVisible.value = true
}

// 提交规则表单
const submitRuleForm = () => {
  ruleFormRef.value.validate((valid) => {
    if (valid) {
      if (isEdit.value) {
        // 编辑现有规则
        const index = alertRules.value.findIndex(item => item.id === ruleForm.id)
        if (index !== -1) {
          alertRules.value[index] = { ...ruleForm }
          ElMessage.success('规则更新成功')
        }
      } else {
        // 添加新规则
        const newId = Math.max(...alertRules.value.map(item => item.id), 0) + 1
        alertRules.value.push({
          ...ruleForm,
          id: newId
        })
        ElMessage.success('规则添加成功')
      }
      ruleDialogVisible.value = false
    }
  })
}

// 删除预警规则
const deleteAlertRule = (row) => {
  ElMessageBox.confirm(
    `确定要删除规则 "${row.name}" 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    const index = alertRules.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      alertRules.value.splice(index, 1)
      ElMessage.success('规则删除成功')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 规则状态变更
const handleStatusChange = (row) => {
  ElMessage.success(`规则 "${row.name}" ${row.status ? '已启用' : '已禁用'}`)
}

// 通知方式变更
const handleNotificationChange = (type) => {
  ElMessage.success(`${type === 'email' ? '邮件' : type === 'sms' ? '短信' : '系统内'}通知${notificationSettings[type].enabled ? '已启用' : '已禁用'}`)
}

// 保存通知设置
const saveNotificationSettings = () => {
  // 实际项目中应该调用API保存设置
  ElMessage.success('通知设置保存成功')
}

// 保存系统参数
const saveSystemParameters = () => {
  // 实际项目中应该调用API保存设置
  ElMessage.success('系统参数保存成功')
}

// 重置系统参数
const resetSystemParameters = () => {
  ElMessageBox.confirm(
    '确定要恢复默认系统参数吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // 重置为默认值
    systemParameters.defaultStockThreshold = 300
    systemParameters.defaultExpiryDays = 180
    systemParameters.slowMovingDays = 90
    systemParameters.dataRetentionDays = 365
    systemParameters.autoBackup = true
    systemParameters.backupFrequency = 'daily'
    systemParameters.backupRetention = 14
    
    ElMessage.success('系统参数已恢复默认')
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}
</script>

<style scoped>
.settings-container {
  padding: 20px;
  width: 100%;
  box-sizing: border-box;
}

.settings-card {
  margin-bottom: 20px;
  width: 100%;
}

.tab-content {
  width: 100%;
}

.el-table {
  width: 100% !important;
}

.el-form {
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tab-content {
  padding: 20px 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
}

.sub-settings {
  padding-left: 20px;
  margin-bottom: 20px;
  border-left: 2px solid #ebeef5;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}
</style>