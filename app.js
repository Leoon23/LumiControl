async function buscarSalas() {
    const resposta = await fetch('http://localhost:3000/salas')
    const salas = await resposta.json()
    console.log(salas)
    mostrarSalas(salas)
}

function mostrarSalas(salas) {
    const secao = document.getElementById('salas')
    secao.innerHTML = ''

    salas.forEach(sala => {
        secao.innerHTML += `
      <div class="sala-item ${sala.ligada ? 'ligada' : ''}">
        <div>
          <div class="sala-nome">${sala.name} ${sala.ligada ? '💡' : '🔦'}</div>
          <div class="sala-status">${sala.ligada ? 'Ligada' : 'Desligada'}</div>
        </div>
        <button class="${sala.ligada ? 'desligar' : ''}" onclick="toggleSala(${sala.id})">
          ${sala.ligada ? 'Desligar' : 'Ligar'}
        </button>
      </div>
    `
    })
}
async function toggleSala(id) {
    await fetch(`http://localhost:3000/salas/${id}`, {
        method: 'PUT'
    })
    buscarSalas()
}

buscarSalas()

async function buscarSensores() {
    const resposta = await fetch('http://localhost:3000/sensores')
    const sensores = await resposta.json()
    mostrarSensores(sensores)
}

async function buscarEnergia() {
    const resposta = await fetch('http://localhost:3000/energia')
    const energia = await resposta.json()
    mostrarEnergia(energia)
}
function mostrarSensores(sensores) {
  const secao = document.getElementById('sensores')
  secao.innerHTML = ''

  sensores.forEach(sensor => {
    secao.innerHTML += `
      <div class="sensor-item">
        <div class="sensor-nome">${sensor.nome}</div>
        <div class="sensor-sala">${sensor.sala}</div>
        <div class="sensor-valor">${sensor.valor || ''}</div>
        <div class="sensor-status">${sensor.status}</div>
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

buscarSensores()
buscarEnergia()

// Liga todas as salas
async function ligarTodas() {
  await fetch('http://localhost:3000/salas/ligar-todas', { method: 'POST' })
  buscarSalas()
  buscarEnergia()
}

// Desliga todas as salas
async function desligarTodas() {
  await fetch('http://localhost:3000/salas/desligar-todas', { method: 'POST' })
  buscarSalas()
  buscarEnergia()
}

// Atualiza tudo sozinho a cada 5 segundos
setInterval(() => {
  buscarSalas()
  buscarSensores()
  buscarEnergia()
}, 5000)


