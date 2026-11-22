// ================= LumiControl - Seu código original =================
async function buscarSalas() {
    const resposta = await fetch('http://localhost:3000/salas')
    const salas = await resposta.json()
    console.log(salas)
    estado.salas = salas
    mostrarSalas(salas)
    atualizarResumoSalas(salas)
    atualizarGraficoSalas(salas)
}

function mostrarSalas(salas) {
    const secao = document.getElementById('salas')
    secao.innerHTML = ''

    const filtradas = filtrarSalas(salas)

    salas.forEach(sala => {
        // usa a lista filtrada se tiver filtro ativo
    })

    filtradas.forEach(sala => {
        secao.innerHTML += `
      <div class="sala-item ${sala.ligada ? 'ligada' : ''}" id="sala-${sala.id}">
        <div>
          <div class="sala-nome">${sala.name} ${sala.ligada ? '💡' : '🔦'}</div>
          <div class="sala-status">${sala.ligada ? 'Ligada' : 'Desligada'}</div>
          <div class="sala-info">ID ${sala.id} - Clique para alternar</div>
        </div>
        <button class="${sala.ligada ? 'desligar' : ''}" onclick="toggleSala(${sala.id})">
          ${sala.ligada ? 'Desligar' : 'Ligar'}
        </button>
      </div>
    `
    })

    if (filtradas.length === 0) {
      secao.innerHTML = '<p class="vazio">Nenhuma sala encontrada.</p>'
    }
}

async function toggleSala(id) {
    const btn = document.querySelector(`#sala-${id} button`)
    if (btn) btn.textContent = '...'
    await fetch(`http://localhost:3000/salas/${id}`, {
        method: 'PUT'
    })
    buscarSalas()
    buscarEnergia()
    mostrarNotificacao('Sala atualizada com sucesso')
}

async function buscarSensores() {
    const resposta = await fetch('http://localhost:3000/sensores')
    const sensores = await resposta.json()
    estado.sensores = sensores
    mostrarSensores(sensores)
    verificarAlertas(sensores)
}

async function buscarEnergia() {
    const resposta = await fetch('http://localhost:3000/energia')
    const energia = await resposta.json()
    estado.energia = energia
    mostrarEnergia(energia)
    calcularEconomia(energia)
    atualizarConta()
}

function mostrarSensores(sensores) {
  const secao = document.getElementById('sensores')
  secao.innerHTML = ''

  sensores.forEach(sensor => {
    const icone = iconeSensor(sensor.nome)
    secao.innerHTML += `
      <div class="sensor-item">
        <div class="sensor-topo">
          <span>${icone}</span>
          <span class="sensor-status ${sensor.status === 'Ativo' ? 'ok' : ''}">${sensor.status}</span>
        </div>
        <div class="sensor-nome">${sensor.nome}</div>
        <div class="sensor-sala">${sensor.sala}</div>
        <div class="sensor-valor">${sensor.valor || '--'}</div>
        <div class="sensor-hora">Atualizado agora</div>
      </div>
    `
  })
}

function mostrarEnergia(energia) {
  document.getElementById('consumo-atual').textContent = energia.consumoAtual + 'W'
  document.getElementById('consumo-hoje').textContent = energia.consumoHoje + ' kWh'
  document.getElementById('consumo-semana').textContent = energia.consumoSemana + ' kWh'
  document.getElementById('economia').textContent = energia.economia + '%'
}

// Liga todas as salas
async function ligarTodas() {
  await fetch('http://localhost:3000/salas/ligar-todas', { method: 'POST' })
  buscarSalas()
  buscarEnergia()
  mostrarNotificacao('Todas as salas ligadas 💡')
}

// Desliga todas as salas
async function desligarTodas() {
  await fetch('http://localhost:3000/salas/desligar-todas', { method: 'POST' })
  buscarSalas()
  buscarEnergia()
  mostrarNotificacao('Todas as salas desligadas')
}

// ================= Código extra pra passar o CSS =================
let estado = {
  salas: [],
  sensores: [],
  energia: null,
  filtro: 'todas',
  tema: 'escuro',
  ultimaAtualizacao: null
}

function filtrarSalas(salas) {
  if (estado.filtro === 'ligadas') return salas.filter(s => s.ligada)
  if (estado.filtro === 'desligadas') return salas.filter(s => !s.ligada)
  return salas
}

function filtrarPor(status) {
  estado.filtro = status
  mostrarSalas(estado.salas)
  atualizarBotoesFiltro()
}

function atualizarBotoesFiltro() {
  document.querySelectorAll('[data-filtro]').forEach(btn => {
    btn.classList.toggle('ativo', btn.dataset.filtro === estado.filtro)
  })
}

function atualizarResumoSalas(salas) {
  const total = salas.length
  const ligadas = salas.filter(s => s.ligada).length
  const desligadas = total - ligadas
  const elTotal = document.getElementById('total-salas')
  const elLigadas = document.getElementById('salas-ligadas')
  const elDesligadas = document.getElementById('salas-desligadas')
  const elPercent = document.getElementById('percent-ligadas')
  if (elTotal) elTotal.textContent = total
  if (elLigadas) elLigadas.textContent = ligadas
  if (elDesligadas) elDesligadas.textContent = desligadas
  if (elPercent) elPercent.textContent = total ? Math.round((ligadas / total) * 100) + '%' : '0%'
}

function atualizarGraficoSalas(salas) {
  const barra = document.getElementById('barra-salas')
  if (!barra) return
  const total = salas.length || 1
  const ligadas = salas.filter(s => s.ligada).length
  barra.style.width = ((ligadas / total) * 100) + '%'
}

function iconeSensor(nome) {
  if (nome.toLowerCase().includes('temperatura')) return '🌡️'
  if (nome.toLowerCase().includes('umidade')) return '💧'
  if (nome.toLowerCase().includes('presença')) return '👀'
  if (nome.toLowerCase().includes('luminosidade')) return '☀️'
  return '📡'
}

function verificarAlertas(sensores) {
  sensores.forEach(sensor => {
    if (sensor.nome.toLowerCase().includes('temperatura')) {
      const temp = parseInt(sensor.valor)
      if (temp > 30) mostrarNotificacao('⚠️ Temperatura alta em ' + sensor.sala, 'alerta')
    }
  })
}

function calcularEconomia(energia) {
  const el = document.getElementById('economia-mes')
  if (!el) return
  const valor = energia.consumoHoje * 30
  const economizado = valor * (energia.economia / 100)
  el.textContent = 'Você economizou ' + economizado.toFixed(1) + ' kWh este mês'
}

function estimarConta() {
  if (!estado.energia) return 'Calculando...'
  const preco = 0.85
  const conta = estado.energia.consumoHoje * 30 * preco
  return 'R$ ' + conta.toFixed(2) + ' / mês estimado'
}

function atualizarConta() {
  const el = document.getElementById('conta-estimada')
  if (el) el.textContent = estimarConta()
}

function mostrarNotificacao(msg, tipo = 'sucesso') {
  let box = document.getElementById('notificacoes')
  if (!box) {
    box = document.createElement('div')
    box.id = 'notificacoes'
    document.body.appendChild(box)
  }
  const div = document.createElement('div')
  div.className = 'notificacao ' + tipo
  div.textContent = msg
  box.appendChild(div)
  setTimeout(() => div.remove(), 3000)
}

function buscarSalaPorNome(texto) {
  const termo = texto.toLowerCase()
  const filtradas = estado.salas.filter(s => s.name.toLowerCase().includes(termo))
  mostrarSalas(filtradas)
}

function ordenarSalas(criterio) {
  let copia = [...estado.salas]
  if (criterio === 'nome') copia.sort((a, b) => a.name.localeCompare(b.name))
  if (criterio === 'ligadas-primeiro') copia.sort((a, b) => Number(b.ligada) - Number(a.ligada))
  mostrarSalas(copia)
}

function alternarTema() {
  estado.tema = estado.tema === 'escuro' ? 'claro' : 'escuro'
  document.body.classList.toggle('tema-claro', estado.tema === 'claro')
}

function atualizarRelogio() {
  const el = document.getElementById('relogio')
  if (!el) return
  el.textContent = new Date().toLocaleTimeString('pt-BR')
}

function atualizarData() {
  const el = document.getElementById('data-hoje')
  if (!el) return
  el.textContent = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
}

function iniciar() {
  buscarSalas()
  buscarSensores()
  buscarEnergia()
  atualizarRelogio()
  atualizarData()
  atualizarConta()
}

// Atualiza tudo sozinho a cada 5 segundos
setInterval(() => {
  buscarSalas()
  buscarSensores()
  buscarEnergia()
  estado.ultimaAtualizacao = new Date()
}, 5000)

setInterval(atualizarRelogio, 1000)

iniciar()
