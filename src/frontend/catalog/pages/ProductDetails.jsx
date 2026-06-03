import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { catalogApi } from "../../services/api"
import { useCart } from "../../contexts/CartContext"
import { resolveImageUri } from "../../shared/helpers/imageResolver"

const PRICE_FORMATTER = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
})

export default function ProductDetails() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { addItem } = useCart()

    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)

    // seleção do usuário
    const [selectedVariant, setSelectedVariant] = useState(null)
    const [selectedSku, setSelectedSku] = useState(null)
    const [quantity, setQuantity] = useState(1)
    const [addedToCart, setAddedToCart] = useState(false)

    useEffect(() => {
        async function loadProduct() {
            try {
                const data = await catalogApi.getProductById(id)
                setProduct(data)
            } finally {
                setLoading(false)
            }
        }

        loadProduct()
    }, [id])

    if (loading) {
        return <div className="p-10 animate-pulse h-80 bg-gray-100" />
    }

    if (!product) {
        return <p className="p-10">Produto não encontrado</p>
    }

    // pega preço do SKU selecionado
    const price = selectedSku?.price ?? null

    // selecionar variante (cor)
    const handleSelectVariant = (variant) => {
        setSelectedVariant(variant)
        setSelectedSku(null)
    }

    // adicionar ao carrinho
    const handleAddToCart = () => {
        const item = {
            productId: product.id,
            name: product.name,
            variant: selectedVariant?.color,
            sku: selectedSku?.size,
            skuId: selectedSku?.id,
            price: selectedSku?.price,
            quantity,
        }

        // Adicionar ao cart context
        addItem(item)
        setAddedToCart(true)
    }

    return (
        <div className="max-w-6xl mx-auto p-10 grid grid-cols-1 md:grid-cols-2 gap-10">

            {/* IMAGEM */}
            <div className="border bg-gray-50 aspect-square flex items-center justify-center">
                {resolveImageUri(product.urlImg)
                    ? <img src={resolveImageUri(product.urlImg)} alt={product.name} className="w-full h-full object-cover" />
                    : <span className="text-gray-300 text-6xl">◻</span>}
            </div>

            {/* INFO */}
            <div className="flex flex-col gap-4">

                <span className="text-xs uppercase text-gray-400">
                    {product.category?.name}
                </span>

                <h1 className="text-3xl font-bold">
                    {product.name}
                </h1>

                <p className="text-gray-600">
                    {product.description}
                </p>

                {/* VARIANTES (COR) */}
                <div>
                    <h3 className="font-semibold mb-2">Cores</h3>

                    <div className="flex gap-2 flex-wrap">
                        {product.variants?.map(v => (
                            <button
                                key={v.id}
                                onClick={() => handleSelectVariant(v)}
                                className={`px-4 py-2 border text-sm ${selectedVariant?.id === v.id
                                        ? "bg-black text-white"
                                        : "bg-white"
                                    }`}
                            >
                                {v.color}
                            </button>
                        ))}
                    </div>
                </div>

                {/* TAMANHOS (SKU) */}
                {selectedVariant && (
                    <div>
                        <h3 className="font-semibold mb-2">Tamanhos</h3>

                        <div className="flex gap-2 flex-wrap">
                            {selectedVariant.skus?.map(sku => (
                                <button
                                    key={sku.id}
                                    onClick={() => setSelectedSku(sku)}
                                    className={`px-4 py-2 border text-sm ${selectedSku?.id === sku.id
                                            ? "bg-black text-white"
                                            : "bg-white"
                                        }`}
                                >
                                    {sku.size}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* PREÇO */}
                <div className="mt-2">
                    <p className="text-2xl font-bold">
                        {price
                            ? PRICE_FORMATTER.format(price)
                            : "Selecione variação"}
                    </p>
                </div>

                {/* QUANTIDADE */}
                <div className="flex items-center gap-3">

                    <button
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        className="w-9 h-9 flex items-center justify-center rounded-full border border-black-300 text-lg hover:bg-black-100 transition"
                    >
                        -
                    </button>

                    <span className="min-w-6 text-center font-medium">
                        {quantity}
                    </span>

                    <button
                        onClick={() => setQuantity(q => q + 1)}
                        className="w-9 h-9 flex items-center justify-center rounded-full border border-black-300 text-lg hover:bg-gray-100 transition"
                    >
                        +
                    </button>

                </div>

                {/* BOTÕES */}
                {!addedToCart ? (
                    <button
                        disabled={!selectedSku}
                        onClick={handleAddToCart}
                        className="mt-4 bg-black text-white py-3 disabled:opacity-50"
                    >
                        Adicionar ao carrinho
                    </button>
                ) : (
                    <div className="flex gap-3 mt-4">
                        <button
                            onClick={() => navigate("/cart")}
                            className="flex-1 bg-black text-white py-3"
                        >
                            Ver carrinho
                        </button>

                        <button
                            onClick={() => navigate("/products")}
                            className="flex-1 border py-3"
                        >
                            Continuar comprando
                        </button>
                    </div>
                )}

            </div>
        </div>
    )
}