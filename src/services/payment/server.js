const express = require('express');
const app = express();

app.use(express.json());

// Endpoint de Healthcheck (para o Docker e Gateway saberem que a API está viva)
app.get('/health', (req, res) => {
    res.status(200).json({ status: "ok", service: "paymentapi" });
});

// Endpoint principal para simular o pagamento
app.post('/payments/process', (req, res) => {
    const { orderId, value } = req.body;

    console.log(`[PaymentAPI] Recebido pedido de pagamento para Order: ${orderId} | Valor: ${value}`);

    // Regra Fake: Se o valor não for enviado, dá erro 400.
    if (!orderId || !value) {
        return res.status(400).json({
            status: "error",
            message: "Faltam dados: orderId ou value."
        });
    }

    // Regra Fake 2: Se o valor terminar em .99, o cartão é "recusado".
    const isDeclined = value.toString().endsWith('.99');

    if (isDeclined) {
        console.log(`[PaymentAPI] Pagamento RECUSADO. Order: ${orderId}`);
        return res.status(402).json({
            transactionId: null,
            status: "DECLINED",
            message: "Cartão recusado (simulação)."
        });
    }

    // Se passar pelas regras, o pagamento é aprovado!
    const transactionId = `TRX-${Math.floor(Math.random() * 1000000)}`;
    console.log(`[PaymentAPI] Pagamento APROVADO! TRX: ${transactionId}`);

    return res.status(201).json({
        transactionId: transactionId,
        status: "APPROVED",
        orderId: orderId,
        processedAt: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`PaymentAPI Fake rodando na porta ${PORT}`);
});
