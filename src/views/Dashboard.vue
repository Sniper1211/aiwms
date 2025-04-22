<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <!-- 统计卡片 -->
      <el-col :xs="24" :sm="12" :lg="6" v-for="(item, index) in statisticsData" :key="index">
        <el-card class="statistics-card" :body-style="{ padding: '20px' }">
          <div class="card-header">
            <el-icon class="card-icon" :style="{ background: item.color }">
              <component :is="item.icon" />
            </el-icon>
            <div class="card-title">{{ item.title }}</div>
          </div>
          <div class="card-value">{{ item.value }}</div>
          <div class="card-footer">
            <span :class="item.trend === 'up' ? 'trend-up' : 'trend-down'">
              <el-icon><component :is="item.trend === 'up' ? 'ArrowUp' : 'ArrowDown'" /></el-icon>
              {{ item.rate }}%
            </span>
            <span class="trend-text">较上周</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <!-- 库存预警图表 -->
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header-title">
              <span>库存预警统计</span>
              <el-tag type="danger" size="small" effect="dark">{{ alertCount }}个预警</el-tag>
            </div>
          </template>
          <div class="chart-placeholder">
            <el-empty description="图表数据加载中..."></el-empty>
          </div>
        </el-card>
      </el-col>

      <!-- 库存趋势图表 -->
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header-title">
              <span>库存趋势分析</span>
              <el-select v-model="timeRange" placeholder="选择时间范围" size="small">
                <el-option label="最近7天" value="7days" />
                <el-option label="最近30天" value="30days" />
                <el-option label="最近90天" value="90days" />
              </el-select>
            </div>
          </template>
          <div class="chart-placeholder">
            <el-empty description="图表数据加载中..."></el-empty>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="table-row">
      <!-- 最近预警列表 -->
      <el-col :span="24">
        <el-card class="table-card">
          <template #header>
            <div class="card-header-title">
              <span>最近预警记录</span>
              <el-button type="primary" size="small" plain>查看全部</el-button>
            </div>
          </template>
          <el-table :data="recentAlerts" style="width: 100%" :border="false">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="product" label="商品名称" />
            <el-table-column prop="type" label="预警类型">
              <template #default="scope">
                <el-tag :type="scope.row.type === '库存不足' ? 'danger' : 'warning'">
                  {{ scope.row.type }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="current" label="当前库存" />
            <el-table-column prop="threshold" label="预警阈值" />
            <el-table-column prop="time" label="预警时间" />
            <el-table-column label="操作" width="150">
              <template #default>
                <el-button type="primary" link>处理</el-button>
                <el-button type="info" link>忽略</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 统计数据
const statisticsData = [
  {
    title: '总库存重量(千克)',
    value: '5,670.5',
    icon: 'Goods',
    color: '#409EFF',
    trend: 'up',
    rate: 12.5
  },
  {
    title: '预警原材料',
    value: '18',
    icon: 'Warning',
    color: '#F56C6C',
    trend: 'up',
    rate: 8.2
  },
  {
    title: '本月入库(千克)',
    value: '1,850.0',
    icon: 'TopRight',
    color: '#67C23A',
    trend: 'up',
    rate: 3.8
  },
  {
    title: '本月出库(千克)',
    value: '1,230.5',
    icon: 'BottomLeft',
    color: '#E6A23C',
    trend: 'down',
    rate: 2.3
  }
]

// 预警数量
const alertCount = ref(18)

// 时间范围选择
const timeRange = ref('7days')

// 最近预警记录
const recentAlerts = [
  {
    id: 'AL001',
    product: 'PP聚丙烯塑料板材',
    type: '库存不足',
    current: 450.0,
    threshold: 500.0,
    time: '2023-06-15 09:23:12'
  },
  {
    id: 'AL002',
    product: '丁腈橡胶密封圈材料',
    type: '库存不足',
    current: 320.0,
    threshold: 350.0,
    time: '2023-06-14 16:45:30'
  },
  {
    id: 'AL003',
    product: 'EPDM三元乙丙橡胶',
    type: '即将过期',
    current: 850.0,
    threshold: '30天内',
    time: '2023-06-14 10:12:45'
  },
  {
    id: 'AL004',
    product: '304不锈钢板',
    type: '库存不足',
    current: 180.0,
    threshold: 200.0,
    time: '2023-06-13 14:23:56'
  },
  {
    id: 'AL005',
    product: '6063铝合金型材',
    type: '库存不足',
    current: 0.0,
    threshold: 200.0,
    time: '2023-06-12 11:34:22'
  }
]
</script>

<style scoped>
.dashboard-container {
  padding: 10px;
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
}

.statistics-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.card-icon {
  padding: 8px;
  border-radius: 8px;
  color: white;
  margin-right: 10px;
}

.card-title {
  font-size: 14px;
  color: #606266;
}

.card-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}

.card-footer {
  font-size: 12px;
  display: flex;
  align-items: center;
}

.trend-up {
  color: #67C23A;
  margin-right: 5px;
}

.trend-down {
  color: #F56C6C;
  margin-right: 5px;
}

.trend-text {
  color: #909399;
}

.chart-row, .table-row {
  margin-bottom: 20px;
}

.chart-card, .table-card {
  border-radius: 8px;
}

.card-header-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-placeholder {
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>