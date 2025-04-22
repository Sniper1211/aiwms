<template>
  <router-view />
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  width: 100%;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}

.alerts-container,
.settings-container,
.inventory-container,
.dashboard-container {
  width: 100%;
  box-sizing: border-box;
}

.operation-area {
  width: 100%;
  margin-bottom: 20px;
}

.el-card {
  width: 100%;
  margin-bottom: 20px;
}
</style>
