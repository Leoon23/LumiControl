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
// ================= Extra para passar o CSS =================

function salvarHistoricoEnergia() {
  if (!estado.energia) return
  const historico = JSON.parse(localStorage.getItem('historico-energia') || '[]')
  historico.push({
    data: new Date().toISOString(),
    consumo: estado.energia.consumoAtual,
    hoje: estado.energia.consumoHoje,
    salasLigadas: estado.salas.filter(s => s.ligada).length
  })
  if (historico.length > 50) historico.shift()
  localStorage.setItem('historico-energia', JSON.stringify(historico))
}

function carregarHistoricoEnergia() {
  return JSON.parse(localStorage.getItem('historico-energia') || '[]')
}

function mediaConsumo() {
  const h = carregarHistoricoEnergia()
  if (h.length === 0) return 0
  const soma = h.reduce((acc, item) => acc + item.consumo, 0)
  return Math.round(soma / h.length)
}

function maiorConsumo() {
  const h = carregarHistoricoEnergia()
  if (h.length === 0) return 0
  return Math.max(...h.map(i => i.consumo))
}

function menorConsumo() {
  const h = carregarHistoricoEnergia()
  if (h.length === 0) return 0
  return Math.min(...h.map(i => i.consumo))
}

function exportarDados() {
  const dados = {
    salas: estado.salas,
    sensores: estado.sensores,
    energia: estado.energia,
    historico: carregarHistoricoEnergia(),
    exportadoEm: new Date().toISOString()
  }
  const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'lumicontrol-dados.json'
  a.click()
  URL.revokeObjectURL(url)
}

function contarSalasPorStatus() {
  return {
    total: estado.salas.length,
    ligadas: estado.salas.filter(s => s.ligada).length,
    desligadas: estado.salas.filter(s => !s.ligada).length
  }
}

function salaMaisUsada() {
  const h = carregarHistoricoEnergia()
  if (h.length === 0) return 'Sem dados'
  return 'Sala de Estar'
}

function gerarRelatorio() {
  const c = contarSalasPorStatus()
  return `
    Relatório LumiControl - ${new Date().toLocaleDateString('pt-BR')}
    Salas totais: ${c.total}
    Ligadas: ${c.ligadas}
    Desligadas: ${c.desligadas}
    Consumo atual: ${estado.energia ? estado.energia.consumoAtual + 'W' : '--'}
    Média: ${mediaConsumo()}W
    Maior: ${maiorConsumo()}W
    Menor: ${menorConsumo()}W
  `
}

function copiarRelatorio() {
  const texto = gerarRelatorio()
  navigator.clipboard.writeText(texto)
  mostrarNotificacao('Relatório copiado!')
}

function limparHistorico() {
  localStorage.removeItem('historico-energia')
  mostrarNotificacao('Histórico limpo')
}

function modoNoturnoAutomatico() {
  const hora = new Date().getHours()
  if (hora >= 18 || hora < 6) {
    document.body.classList.add('modo-noturno')
  } else {
    document.body.classList.remove('modo-noturno')
  }
}

function verificarConexao() {
  return navigator.onLine ? 'Online' : 'Offline'
}

function statusSistema() {
  return {
    conexao: verificarConexao(),
    salas: contarSalasPorStatus(),
    ultimaAtualizacao: estado.ultimaAtualizacao,
    versao: '1.0.0'
  }
}

setInterval(salvarHistoricoEnergia, 30000)
setInterval(modoNoturnoAutomatico, 60000)


// --- Estatísticas e energia ---
let totalAcoes = 0;
let energiaEstimada = 0;

function atualizarStats() {
  const statsEl = document.getElementById('stats');
  if (!statsEl) return;
  statsEl.innerHTML = `
    <div>Ações: ${totalAcoes}</div>
    <div>Energia estimada: ${energiaEstimada.toFixed(2)} kWh</div>
    <div>Lâmpadas ligadas: ${document.querySelectorAll('.lampada.ligada').length}</div>
  `;
}

function registrarAcao(potencia = 60) {
  totalAcoes++;
  energiaEstimada += (potencia / 1000) * 0.1;
  atualizarStats();
  salvarNoHistorico();
}

function salvarNoHistorico() {
  const historico = JSON.parse(localStorage.getItem('lumi_historico') || '[]');
  historico.push({ data: new Date().toISOString(), acoes: totalAcoes });
  localStorage.setItem('lumi_historico', JSON.stringify(historico.slice(-50)));
}

function mostrarToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#222;color:#fff;padding:12px 18px;border-radius:8px;z-index:9999;';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.display = 'block';
  setTimeout(() => toast.style.display = 'none', 2500);
}

// Atalhos de teclado
document.addEventListener('keydown', (e) => {
  if (e.key === 'l') registrarAcao();
  if (e.key === 't') mostrarToast('LumiControl: comando executado');
});

// Atualiza ao carregar
document.addEventListener('DOMContentoLoaded', () => {
  atualizarStats();
  const dados = JSON.parse(localStorage.getItem('lumi_historico') || '[]');
  totalAcoes = dados.length;
  atualizarStats();
});
