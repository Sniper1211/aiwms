const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const path = require('path')
const fs = require('fs')

const app = express()
const PORT = 3000

// 配置中间件
app.use(cors())
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, '../dist')))


// 数据文件路径
const dataPath = path.join(__dirname, 'data')

// 通用数据读取方法
const readData = (filename) => {
  try {
    const data = fs.readFileSync(path.join(dataPath, filename), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    throw new Error(`无法加载数据文件: ${filename}`);
  }
}

// 用户接口
app.get('/api/users', (req, res) => {
  res.json(readData('users.json'))
})

// 新增用户
app.post('/api/users', (req, res) => {
  const users = readData('users.json')
  const newUser = {
    id: users.users.length + 1,
    ...req.body
  }
  users.users.push(newUser)
  fs.writeFileSync(path.join(dataPath, 'users.json'), JSON.stringify(users))
  res.json(newUser)
})

// 更新用户
app.put('/api/users/:id', (req, res) => {
  const users = readData('users.json')
  const index = users.users.findIndex(u => u.id == req.params.id)
  if (index > -1) {
    users.users[index] = { ...users.users[index], ...req.body }
    fs.writeFileSync(path.join(dataPath, 'users.json'), JSON.stringify(users))
    res.json(users.users[index])
  } else {
    res.status(404).json({ message: '用户不存在' })
  }
})

// 删除用户
app.delete('/api/users/:id', (req, res) => {
  const users = readData('users.json')
  const index = users.users.findIndex(u => u.id == req.params.id)
  if (index > -1) {
    const deleted = users.users.splice(index, 1)
    fs.writeFileSync(path.join(dataPath, 'users.json'), JSON.stringify(users))
    res.json(deleted[0])
  } else {
    res.status(404).json({ message: '用户不存在' })
  }
})

// 物料接口
app.get('/api/materials', (req, res) => {
  try {
    res.json(readData('materials.json'));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})

// 新增物料
app.post('/api/materials', (req, res) => {
  const materials = readData('materials.json')
  const newMaterial = {
    id: materials.materials.length + 1,
    ...req.body
  }
  materials.materials.push(newMaterial)
  fs.writeFileSync(path.join(dataPath, 'materials.json'), JSON.stringify(materials))
  res.json(newMaterial)
})

// 更新物料
app.put('/api/materials/:id', (req, res) => {
  const materials = readData('materials.json')
  const index = materials.materials.findIndex(m => m.id == req.params.id)
  if (index > -1) {
    materials.materials[index] = { ...materials.materials[index], ...req.body }
    fs.writeFileSync(path.join(dataPath, 'materials.json'), JSON.stringify(materials))
    res.json(materials.materials[index])
  } else {
    res.status(404).json({ message: '物料不存在' })
  }
})

// 删除物料
app.delete('/api/materials/:id', (req, res) => {
  const materials = readData('materials.json')
  const index = materials.materials.findIndex(m => m.id == req.params.id)
  if (index > -1) {
    const deleted = materials.materials.splice(index, 1)
    fs.writeFileSync(path.join(dataPath, 'materials.json'), JSON.stringify(materials))
    res.json(deleted[0])
  } else {
    res.status(404).json({ message: '物料不存在' })
  }
})

// 警报接口
app.get('/api/alerts', (req, res) => {
  res.json(readData('alerts.json'))
})

// 更新警报状态
app.put('/api/alerts/:id', (req, res) => {
  const alerts = readData('alerts.json')
  const index = alerts.alerts.findIndex(a => a.id == req.params.id)
  if (index > -1) {
    alerts.alerts[index] = { ...alerts.alerts[index], ...req.body }
    fs.writeFileSync(path.join(dataPath, 'alerts.json'), JSON.stringify(alerts))
    res.json(alerts.alerts[index])
  } else {
    res.status(404).json({ message: '警报不存在' })
  }
})

// 删除警报
app.delete('/api/alerts/:id', (req, res) => {
  const alerts = readData('alerts.json')
  const index = alerts.alerts.findIndex(a => a.id == req.params.id)
  if (index > -1) {
    const deleted = alerts.alerts.splice(index, 1)
    fs.writeFileSync(path.join(dataPath, 'alerts.json'), JSON.stringify(alerts))
    res.json(deleted[0])
  } else {
    res.status(404).json({ message: '警报不存在' })
  }
})

// 处理前端路由
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'))
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})