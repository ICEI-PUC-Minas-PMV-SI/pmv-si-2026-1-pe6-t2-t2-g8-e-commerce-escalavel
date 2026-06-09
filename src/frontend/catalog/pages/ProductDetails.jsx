import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { catalogApi } from "../../services/api"
import { useCart } from "../../contexts/CartContext"
import { resolveImageUri } from "../../shared/helpers/imageResolver"

const PRICE_FORMATTER = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
})

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:7000/api'

// Retorna:
//   number  → quantidade disponível (encontrado no estoque)
//   null    → SKU não tem estoque cadastrado (404)
//   undefined → erro de API (401, rede, etc.) → não bloquear
async function fetchSkuStock(skuId) {
    try {
        const token = localStorage.getItem('token')
        const headers = token ? { Authorization: `Bearer ${token}` } : {}
        const res = await fetch(`${BASE_URL}/stock/${skuId}`, { headers })
        if (res.status === 404) return null
        if (!res.ok) return undefined
        const body = await res.json()
        const item = body?.data ?? body
        return typeof item?.quantityAvailable === 'number' ? item.quantityAvailable : undefined
    } catch {
        return undefined
    }
}

export default function ProductDetails() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { addItem } = useCart()

    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)

    // mapa de estoque: { [skuId]: quantityAvailable | null }
    // null = não foi possível verificar, assume disponível
    const [stockMap, setStockMap] = useState({})

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

                const allSkus = (data.variants ?? []).flatMap(v => v.skus ?? [])
                if (allSkus.length > 0) {
                    const results = await Promise.all(allSkus.map(s => fetchSkuStock(s.id)))
                    const map = {}
                    allSkus.forEach((sku, i) => { map[sku.id] = results[i] })
                    setStockMap(map)
                }
            } finally {
                setLoading(false)
            }
        }

        loadProduct()
    }, [id])

    // undefined = erro de API → não bloquear
    // null      = sem cadastro de estoque (404) → bloquear
    // number    = quantidade → bloquear se 0
    const isSkuAvailable = (skuId) => {
        const qty = stockMap[skuId]
        if (qty === undefined) return true   // API inacessível → não bloquear
        if (qty === null) return false        // sem estoque cadastrado → bloquear
        return qty > 0
    }

    const isVariantAvailable = (variant) => {
        const skus = variant.skus ?? []
        if (skus.length === 0) return false
        return skus.some(s => isSkuAvailable(s.id))
    }

    if (loading) {
        return <div className="p-10 animate-pulse h-80 bg-gray-100" />
    }

    if (!product) {
        return <p className="p-10">Produto não encontrado</p>
    }

    // pega preço do SKU selecionado
    const price = selectedSku?.price ?? null

    // selecionar variante (cor) — ignora se indisponível
    const handleSelectVariant = (variant) => {
        if (!isVariantAvailable(variant)) return
        setSelectedVariant(variant)
        setSelectedSku(null)
    }

    // adicionar ao carrinho
    const handleAddToCart = () => {
        if (!selectedSku || !isSkuAvailable(selectedSku.id)) return
        const available = stockMap[selectedSku.id]
        if (typeof available === 'number' && quantity > available) return
        addItem({
            productId: product.id,
            name: product.name,
            variant: selectedVariant?.color,
            sku: selectedSku?.size,
            skuId: selectedSku?.id,
            price: selectedSku?.price,
            quantity,
        })
        setAddedToCart(true)
    }

    const selectedSkuUnavailable = selectedSku && !isSkuAvailable(selectedSku.id)

    const maxQuantity = selectedSku
        ? (typeof stockMap[selectedSku.id] === 'number' ? stockMap[selectedSku.id] : Infinity)
        : Infinity

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
                    <h3 className="font-semibold mb-2">
                        Cor{selectedVariant ? <span className="font-normal text-gray-500 ml-2 text-sm">{selectedVariant.color}</span> : ''}
                    </h3>

                    <div className="flex gap-3 flex-wrap items-center">
                        {product.variants?.map(v => {
                            const isSelected = selectedVariant?.id === v.id
                            const available = isVariantAvailable(v)
                            return (
                                <button
                                    key={v.id}
                                    onClick={() => handleSelectVariant(v)}
                                    title={available ? v.color : `${v.color} — esgotado`}
                                    disabled={!available}
                                    className={`flex items-center justify-center rounded-full border-2 px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-all focus:outline-none
                                        ${isSelected ? 'border-black bg-black text-white shadow-md' : 'border-gray-300 text-gray-800'}
                                        ${available ? 'hover:border-gray-600' : 'opacity-40 cursor-not-allowed line-through'}
                                    `}
                                >
                                    {v.color}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* TAMANHOS (SKU) */}
                {selectedVariant && (
                    <div>
                        <h3 className="font-semibold mb-2">Tamanho</h3>

                        <div className="flex gap-2 flex-wrap">
                            {selectedVariant.skus?.map(sku => {
                                const available = isSkuAvailable(sku.id)
                                const isSelected = selectedSku?.id === sku.id
                                return (
                                    <button
                                        key={sku.id}
                                        onClick={() => available && setSelectedSku(sku)}
                                        disabled={!available}
                                        title={available ? sku.size : `${sku.size} — esgotado`}
                                        className={`relative px-4 py-2 border text-sm transition-all
                                            ${isSelected ? "bg-black text-white border-black" : "bg-white border-gray-300"}
                                            ${available ? "hover:border-black" : "opacity-40 cursor-not-allowed line-through"}
                                        `}
                                    >
                                        {sku.size}
                                    </button>
                                )
                            })}
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
                    <>
                        <button
                            disabled={!selectedSku || !!selectedSkuUnavailable}
                            onClick={handleAddToCart}
                            className="mt-4 bg-black text-white py-3 disabled:opacity-50"
                        >
                            {selectedSkuUnavailable ? 'Esgotado' : 'Adicionar ao carrinho'}
                        </button>
                        {selectedSkuUnavailable && (
                            <p className="text-red-500 text-sm">
                                Este tamanho está esgotado. Escolha outro tamanho ou cor.
                            </p>
                        )}
                    </>
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