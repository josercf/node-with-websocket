const express = require('express');
const expressWs = require('express-ws');
const cors = require('cors');

// Inicializar o Express e habilitar o suporte para websockets.
const app = express();
expressWs(app);

// Middlewares para facilitar o acesso ao corpo da requisição.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Armazenar as conexões WebSocket para poder enviar mensagens para elas.
let wsConnections = [];

// Rota POST para receber previsões e enviar para os websockets conectados.
app.post('/receive-prediction', (req, res) => {
    // Obter os dados da prediction do corpo da requisição
    const predictionData = req.body;
    
    // Enviar os dados para todos os websockets conectados.
    wsConnections.forEach(ws => {
        if (ws.readyState === 1) { // Verificar se a conexão está aberta
            ws.send(JSON.stringify(predictionData));
        }
    });

    // Enviar uma resposta de sucesso.
    res.status(200).send('Prediction data sent to all websockets.');
});

// Rota do WebSocket para receber conexões e responder a 'prediction-request'.
app.ws('/prediction-request', (ws, req) => {
    // Adicionar a nova conexão WebSocket ao array de conexões.
    wsConnections.push(ws);

    // Listener para receber mensagens do cliente.
    ws.on('message', (msg) => {
        console.log(`Received message: ${msg}`);
        if (msg === 'prediction-request') {
            // O cliente está solicitando previsões. A lógica de resposta pode ser implementada aqui.
        }
    });

    // Listener para lidar com conexões fechadas.
    ws.on('close', () => {
        // Remover a conexão fechada do array de conexões.
        wsConnections = wsConnections.filter(conn => conn !== ws);
    });
});

// Iniciar o servidor na porta 3000.
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});