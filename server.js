const express = require('express')
const app = express()

app.use(express.json())

// CORS - sem isso o navegador bloqueia o fetch
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.sendStatus(200)
  next()
})

app.use(express.static('.'))

const salas = [
  { id: 1, name: 'Sala A', ligada: false },
  { id: 2, name: 'Sala B', ligada: false },
  { id: 3, name: 'Sala C', ligada: false }
]

const sensores = [
  { id: 1, nome: 'Sensor de Movimento', sala: 'Sala A', status: 'Detectado', valor: '--' },
  { id: 2, nome: 'Sensor de Luz', sala: 'Sala A', valor: '270 lx', status: 'Ativo' },
  { id: 3, nome: 'Temperatura', sala: 'Corredor', valor: '24.5°C', status: 'Ativo' }
]

const energia = {
  consumoAtual: 680,
  consumoHoje: 3.2,
  consumoSemana: 18.5,
  economia: 12.4
}

function recalcularEnergia() {
  const ligadas = salas.filter(s => s.ligada).length
  energia.consumoAtual = 680 + (ligadas * 120)
  if (energia.consumoAtual < 0) energia.consumoAtual = 0
}

app.get('/', (req, res) => {
  res.send('LumiControl funcionando!')
})

app.get('/salas', (req, res) => {
  res.json(salas)
})

app.put('/salas/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const sala = salas.find(s => s.id === id)
  if (!sala) return res.status(404).json({ erro: 'Sala não encontrada' })
  sala.ligada = !sala.ligada
  recalcularEnergia()
  res.json(sala)
})

app.get('/sensores', (req, res) => {
  res.json(sensores)
})

app.get('/energia', (req, res) => {
  res.json(energia)
})

app.post('/salas/ligar-todas', (req, res) => {
  salas.forEach(sala => sala.ligada = true)
  recalcularEnergia()
  res.json({ mensagem: 'Todas as salas ligadas', salas })
})

app.post('/salas/desligar-todas', (req, res) => {
  salas.forEach(sala => sala.ligada = false)
  recalcularEnergia()
  res.json({ mensagem: 'Todas as salas desligadas', salas })
})

const PORT = 3000
app.listen(PORT, () => {
  console.log(`LumiControl rodando na porta ${PORT}`)
})
