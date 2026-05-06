function OrderCard({ order, onViewDetails }) {
  return (
    <div className="border border-gray-100 rounded-lg p-5 bg-white shadow-sm flex items-center justify-between gap-5 transition hover:scale-[1.02] hover:shadow-md">

      {/* esquerda */}
      <div className="flex items-center gap-4">

        {/* imagem */}
        <div className="w-20 h-20 bg-gray-100 rounded-md flex-shrink-0" />

        {/* infos */}
        <div className="flex flex-col gap-2">

          {/* nome produto */}
          <h3 className="text-base font-semibold text-gray-900">
            {order.productName}
          </h3>

          {/* pedido */}
          <p className="text-sm text-gray-500">
            Pedido #{order.id}
          </p>

          {/* status */}
          <p className="text-sm text-gray-600">
            Status:{" "}
            <span className="text-black font-medium">
              {order.status}
            </span>
          </p>

          {/* total */}
          <p className="text-sm text-gray-600">
            Total:{" "}
            <span className="text-black font-medium">
              R$ {order.total}
            </span>
          </p>

        </div>
      </div>

      {/* botão direita */}
      <button
        onClick={onViewDetails}
        className="px-5 py-2 text-sm border border-black text-black rounded-md hover:bg-black hover:text-white transition whitespace-nowrap"
      >
        Pagina do produto
      </button>

    </div>
  );
}

export default OrderCard;