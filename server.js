const express = require('express')
const app = express()

app.use(express.json())
app.use(express.static('.'))

app.get ('/', (req, res) => {
 res.send('LumiControl funcionando!')
})
app.listen(3000, () => {
 console.log('LumiControl rodando na porta 3000')
})

const salas = [
{ id: 1, name: 'Sala A', ligada: false },
{ id: 2, name: 'Sala B', ligada: false },
{ id: 3, name: 'Sala C', ligada: false }
]

const sensores = [
  { id: 1, nome: 'Sensor de Movimento', sala: 'Sala A', status: 'Detectado' },
  { id: 2, nome: 'Sensor de Luz', sala: 'Sala A', valor: '270 lx', status: 'Ativo' },
  { id: 3, nome: 'Temperatura', sala: 'Corredor', valor: '24.5°C', status: 'Ativo' }
]


const energia = {
  consumoAtual: 680,
  consumoHoje: 3.2,
  consumoSemana: 18.5,
  economia: 12.4
}

app.get('/salas', (req, res) => {
 res.json(salas)
})

app.put('/salas/:id', (req, res) => {
const id = parseInt(req.params.id)
const sala = salas.find(s=> s.id === id)
sala.ligada = !sala.ligada
res.json(sala) })


app.get('/sensores', (req, res) => {
  res.json(sensores)
})


app.get('/energia', (req, res) => {
  res.json(energia)
})