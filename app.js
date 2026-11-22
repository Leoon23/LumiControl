// ================= LumiControl - Corrigido =================
let estado = {
  salas: [],
  sensores: [],
  energia: null,
  filtro: 'todas',
  tema: 'escuro',
  ultimaAtualizacao: null
}

const API = 'http://localhost:3000'

// Dados falsos pra quando não tiver backend (GitHub Pages)
const MOCK = {
  salas: [
    { id: 1, name: 'Sala de Estar', ligada: true },
    { id: 2, name: 'Quarto', ligada: false },
    { id: 3, name: 'Cozinha', ligada: true },
  ],
  sensores: [
    { nome: 'Temperatura', sala: 'Sala de Estar', status: 'Ativo', valor: '24°C' },
    { nome: 'Umidade', sala: 'Quarto', status: 'Ativo', valor: '60%' },
  ],
  energia: { consumoAtual: 120, consumoHoje: 2.4, consumoSemana: 15.2, economia: 18 }
}

async function fetchSeguro(url, options) {
  try {
    const r = await fetch(url, options)
    if (!r.ok) throw new Error('HTTP ' + r.status)
    return await r.json()
  } catch (e) {
    console.warn('Backend offline, usando dados de exemplo:', e.message)
    return null
  }
}

async function buscarSalas() {
  const salas = await fetchSeguro(`${API}/salas`) || MOCK.salas
  estado.salas = salas
  mostrarSalas(salas)
  atualizarResumoSalas(salas)
  atualizarGraficoSalas(salas)
}

function mostrarSalas(salas) {
  const secao = document.getElementById('salas')
  if (!secao) return
  const filtradas = filtrarSalas(salas)
  secao.innerHTML = ''
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
  await fetchSeguro(`${API}/salas/${id}`, { method: 'PUT' })
  const sala = estado.salas.find(s => s.id === id)
  if (sala) sala.ligada = !sala.ligada
  mostrarSalas(estado.salas)
  buscarEnergia()
  mostrarNotificacao('Sala atualizada com sucesso')
}

async function buscarSensores() {
  const sensores = await fetchSeguro(`${API}/sensores`) || MOCK.sensores
  estado.sensores = sensores
  mostrarSensores(sensores)
  verificarAlertas(sensores)
}

async function buscarEnergia() {
  const energia = await fetchSeguro(`${API}/energia`) || MOCK.energia
  estado.energia = energia
  mostrarEnergia(energia)
  calcularEconomia(energia)
  atualizarConta()
}

function mostrarSensores(sensores) {
  const secao = document.getElementById('sensores')
  if (!secao) return
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
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v }
  set('consumo-atual', energia.consumoAtual + 'W')
  set('consumo-hoje', energia.consumoHoje + ' kWh')
  set('consumo-semana', energia.consumoSemana + ' kWh')
  set('economia', energia.economia + '%')
}

async function ligarTodas() {
  await fetchSeguro(`${API}/salas/ligar-todas`, { method: 'POST' })
  estado.salas.forEach(s => s.ligada = true)
  mostrarSalas(estado.salas)
  buscarEnergia()
  mostrarNotificacao('Todas as salas ligadas 💡')
}

async function desligarTodas() {
  await fetchSeguro(`${API}/salas/desligar-todas`, { method: 'POST' })
  estado.salas.forEach(s => s.ligada = false)
  mostrarSalas(estado.salas)
  buscarEnergia()
  mostrarNotificacao('Todas as salas desligadas')
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
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v }
  set('total-salas', total)
  set('salas-ligadas', ligadas)
  set('salas-desligadas', desligadas)
  set('percent-ligadas', total ? Math.round((ligadas / total) * 100) + '%' : '0%')
}

function atualizarGraficoSalas(salas) {
  const barra = document.getElementById('barra-salas')
  if (!barra) return
  const total = salas.length || 1
  const ligadas = salas.filter(s => s.ligada).length
  barra.style.width = ((ligadas / total) * 100) + '%'
}

function iconeSensor(nome) {
  const n = (nome || '').toLowerCase()
  if (n.includes('temperatura')) return '🌡️'
  if (n.includes('umidade')) return '💧'
  if (n.includes('presença')) return '👀'
  if (n.includes('luminosidade')) return '☀️'
  return '📡'
}

function verificarAlertas(sensores) {
  sensores.forEach(sensor => {
    if ((sensor.nome || '').toLowerCase().includes('temperatura')) {
      const temp = parseInt(sensor.valor)
      if (!isNaN(temp) && temp > 30) mostrarNotificacao('⚠️ Temperatura alta em ' + sensor.sala, 'alerta')
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
  document.querySelectorAll('.sala-item').forEach(item => {
    const nome = item.querySelector('.sala-nome')?.textContent.toLowerCase() || ''
    item.style.display = nome.includes(termo) ? '' : 'none'
  })
}

function ordenarSalas(criterio) {
  let copia = [...estado.salas]
  if (criterio === 'nome') copia.sort((a, b) => a.name.localeCompare(b.name))
  if (criterio === 'ligadas-primeiro') copia.sort((a, b) => Number(b.ligada) - Number(a.ligada))
  estado.salas = copia
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

function salvarHistoricoEnergia() {
  if (!estado.energia) return
  const historico = JSON.parse(localStorage.getItem('historico-energia') || '[]')
  historico.push({ data: new Date().toISOString(), consumo: estado.energia.consumoAtual, hoje: estado.energia.consumoHoje, salasLigadas: estado.salas.filter(s => s.ligada).length })
  if (historico.length > 50) historico.shift()
  localStorage.setItem('historico-energia', JSON.stringify(historico))
}

function carregarHistoricoEnergia() { return JSON.parse(localStorage.getItem('historico-energia') || '[]') }
function mediaConsumo() { const h = carregarHistoricoEnergia(); if (!h.length) return 0; return Math.round(h.reduce((a, i) => a + i.consumo, 0) / h.length) }
function maiorConsumo() { const h = carregarHistoricoEnergia(); return h.length ? Math.max(...h.map(i => i.consumo)) : 0 }
function menorConsumo() { const h = carregarHistoricoEnergia(); return h.length ? Math.min(...h.map(i => i.consumo)) : 0 }

function exportarDados() {
  const dados = { salas: estado.salas, sensores: estado.sensores, energia: estado.energia, historico: carregarHistoricoEnergia(), exportadoEm: new Date().toISOString() }
  const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = 'lumicontrol-dados.json'; a.click(); URL.revokeObjectURL(url)
}

function contarSalasPorStatus() { return { total: estado.salas.length, ligadas: estado.salas.filter(s => s.ligada).length, desligadas: estado.salas.filter(s => !s.ligada).length } }
function gerarRelatorio() { const c = contarSalasPorStatus(); return `Relatório LumiControl - ${new Date().toLocaleDateString('pt-BR')}\nSalas: ${c.total} | Ligadas: ${c.ligadas} | Desligadas: ${c.desligadas}\nConsumo: ${estado.energia ? estado.energia.consumoAtual + 'W' : '--'}\nMédia: ${mediaConsumo()}W | Maior: ${maiorConsumo()}W | Menor: ${menorConsumo()}W` }
function copiarRelatorio() { navigator.clipboard.writeText(gerarRelatorio()); mostrarNotificacao('Relatório copiado!') }
function limparHistorico() { localStorage.removeItem('historico-energia'); mostrarNotificacao('Histórico limpo') }
function modoNoturnoAutomatico() { const h = new Date().getHours(); document.body.classList.toggle('modo-noturno', h >= 18 || h < 6) }
function verificarConexao() { return navigator.onLine ? 'Online' : 'Offline' }
function statusSistema() { return { conexao: verificarConexao(), salas: contarSalasPorStatus(), ultimaAtualizacao: estado.ultimaAtualizacao, versao: '1.0.0' } }

let totalAcoes = 0
let energiaEstimada = 0
function atualizarStats() { const el = document.getElementById('stats'); if (!el) return; el.innerHTML = `<div>Ações: ${totalAcoes}</div><div>Energia estimada: ${energiaEstimada.toFixed(2)} kWh</div><div>Lâmpadas ligadas: ${document.querySelectorAll('.sala-item.ligada').length}</div>` }
function registrarAcao(p = 60) { totalAcoes++; energiaEstimada += (p / 1000) * 0.1; atualizarStats(); const h = JSON.parse(localStorage.getItem('lumi_historico') || '[]'); h.push({ data: new Date().toISOString(), acoes: totalAcoes }); localStorage.setItem('lumi_historico', JSON.stringify(h.slice(-50))) }
function mostrarToast(msg) { let t = document.getElementById('toast'); if (!t) { t = document.createElement('div'); t.id = 'toast'; t.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#222;color:#fff;padding:12px 18px;border-radius:8px;z-index:9999;'; document.body.appendChild(t) } t.textContent = msg; t.style.display = 'block'; setTimeout(() => t.style.display = 'none', 2500) }

document.addEventListener('keydown', (e) => { if (e.key === 'l') registrarAcao(); if (e.key === 't') mostrarToast('LumiControl: comando executado') })

function iniciar() {
  buscarSalas()
  buscarSensores()
  buscarEnergia()
  atualizarRelogio()
  atualizarData()
  atualizarConta()
  setInterval(() => { buscarSalas(); buscarSensores(); buscarEnergia(); estado.ultimaAtualizacao = new Date() }, 5000)
  setInterval(atualizarRelogio, 1000)
  setInterval(salvarHistoricoEnergia, 30000)
  setInterval(modoNoturnoAutomatico, 60000)
}

document.addEventListener('DOMContentLoaded', () => {
  iniciar()
  atualizarStats()
  const dados = JSON.parse(localStorage.getItem('lumi_historico') || '[]')
  totalAcoes = dados.length
  atualizarStats()
})
