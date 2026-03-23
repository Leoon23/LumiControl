💡 ⚡ LumiControl - Sistema de Telemetria e Gestão de Carga Elétrica
O LumiControl é uma solução de IoT desenvolvida para o monitoramento e controle de ativos elétricos em tempo real. Unindo a Eletrotécnica ao Node.js, o sistema permite a visualização e o comando remoto de cargas, focando em eficiência energética e automação industrial.
🎯 Diferencial do Projeto
Diferente de sistemas comuns, o LumiControl simula um Centro de Operação e Manutenção (O&M), onde o monitoramento das grandezas elétricas é vital para a saúde da rede e economia de custos.
🚀 Tecnologias e Protocolos
Backend: Node.js & Express (Integração de dados em tempo real).
Frontend: Dashboard interativo (HTML5/CSS3/JS).
Telemetria: API REST estruturada para leitura de sensores e dados de energia.
⚙️ Como rodar o ambiente de monitoramento
bash
# Instalar dependências
npm install

# Iniciar o servidor de telemetria
node server.js
Use o código com cuidado.

Acesse o painel em: http://localhost:3000
📡 Documentação da API (Endpoints de Controle)
Método	Rota	Aplicação em O&M
GET	/salas	Monitoramento de estado dos ativos
PUT	/salas/:id	Comando remoto de acionamento/desligamento
GET	/sensores	Telemetria de dados de campo
GET	/energia	Análise de Consumo e Eficiência Energética
👨‍💻 Autor: Leonardo Cardoso Silva
Técnico em Eletrotécnica (em conclusão) | Dev Backend IoT.
Experiência em Infraestrutura de Redes e Dispositivos Inteligentes (Ex-Ascend Tecnologia).
Residente em Parelhas (RN) / Natural de Tianguá (CE) - Foco nos Polos de Energia Renovável.
