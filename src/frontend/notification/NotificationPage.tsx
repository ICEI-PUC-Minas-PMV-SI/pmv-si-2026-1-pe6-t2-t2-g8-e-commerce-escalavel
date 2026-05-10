import React, { useEffect, useState } from 'react';

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/notifications')
      .then(res => res.json())
      .then(data => setNotifications(data))
      .catch(err => {
        console.warn("Back-end off. Carregando dados de demonstração.");
        // DADOS DE EXEMPLO PARA A APRESENTAÇÃO
        setNotifications([
          { id: 1, title: 'Pedido #1234', message: 'Seu pagamento foi aprovado!', type: 'success', createdAt: new Date().toISOString() },
          { id: 2, title: 'Estoque Baixo', message: 'Camiseta Insider Preta está quase acabando.', type: 'warning', createdAt: new Date().toISOString() },
          { id: 3, title: 'Novo Login', message: 'Detectamos um novo acesso na sua conta.', type: 'info', createdAt: new Date().toISOString() }
        ]);
      });
  }, []);

  return (
    <div className="min-h-screen bg-black p-8 text-white"> {/* Ajustei para o tema escuro do seu projeto */}
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-white border-b border-gray-800 pb-4">Histórico de Notificações</h1>
        {notifications.length === 0 ? (
          <div className="bg-gray-900 p-6 rounded shadow text-center text-gray-500 border border-gray-800">
            Nenhuma notificação encontrada.
          </div>
        ) : (
          notifications.map(n => (
            <div key={n.id} className={`mb-4 p-4 border-l-4 rounded bg-gray-900 shadow-sm border-gray-800 ${
              n.type === 'success' ? 'border-l-green-500' : 
              n.type === 'warning' ? 'border-l-yellow-500' : 'border-l-blue-500'
            }`}>
              <h3 className="font-bold text-white">{n.title}</h3>
              <p className="text-gray-400 text-sm">{n.message}</p>
              <span className="text-xs text-gray-500 mt-2 block">
                {new Date(n.createdAt).toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationPage;
