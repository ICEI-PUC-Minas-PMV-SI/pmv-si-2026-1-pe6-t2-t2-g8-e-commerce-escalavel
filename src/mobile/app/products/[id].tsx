import React, { useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Image,
    Pressable,
} from 'react-native';
import { Text, Button, ActivityIndicator, Modal, Portal } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { catalogService } from '@/src/services/catalogService';
import { useCart } from '@/contexts/CartContext';
import type { Product, Sku } from '@/src/types/catalog';

export default function ProductScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { addItem, increaseQty, decreaseQty } = useCart();
    const router = useRouter();

    const [product, setProduct] = useState<Product | null>(null);
    const [selectedVariant, setSelectedVariant] = useState<any>(null);
    const [selectedSku, setSelectedSku] = useState<Sku | null>(null);
    const [quantity, setQuantity] = useState(1);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [showModal, setShowModal] = useState(false);

    const colorMap: Record<string, string> = {
        Branca: '#FFFFFF',
        Preta: '#000000',
        Azul: '#1E3A8A',
        Vermelha: '#DC2626',
        Verde: '#16A34A',
        Cinza: '#6B7280',
        Bege: '#E5D3B3',
        Marrom: '#7C4A2D',
    };

    useEffect(() => {
        async function loadProduct() {
            try {
                setLoading(true);

                const data = await catalogService.getProductById(id);
                setProduct(data);

                const firstVariant = data.variants?.[0];
                if (firstVariant) {
                    setSelectedVariant(firstVariant);
                    setSelectedSku(firstVariant.skus?.[0] || null);
                }
            } catch (e) {
                setError('Erro ao carregar produto');
            } finally {
                setLoading(false);
            }
        }

        if (id) loadProduct();
    }, [id]);

    function handleAddToCart() {
        if (!product || !selectedSku) return;

        addItem({
            skuId: selectedSku.id,
            productId: product.id,
            productName: product.name,
            unitPrice: selectedSku.price,
            quantity,
            size: selectedSku.size ?? selectedSku.code ?? 'U',
            color: selectedVariant?.color ?? 'N/A', // 👈 GARANTIDO
        });

        setShowModal(true);
    }

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator />
                <Text>Carregando produto...</Text>
            </View>
        );
    }

    if (error || !product) {
        return (
            <View style={styles.center}>
                <Text style={{ color: 'red' }}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>

                {/* IMAGEM */}
                <Image
                    source={{ uri: product.urlImg || 'https://via.placeholder.com/300' }}
                    style={styles.image}
                />

                {/* NOME */}
                <Text style={styles.name}>{product.name}</Text>

                {/* DESCRIÇÃO */}
                {!!product.description && (
                    <Text style={styles.description}>
                        {product.description}
                    </Text>
                )}

                {/* PREÇO */}
                <Text style={styles.price}>
                    R$ {selectedSku?.price?.toFixed(2)} unidade
                </Text>

                {/* CORES + TAMANHOS */}
                <View style={styles.optionsRow}>

                    {/* TAMANHOS */}
                    <View style={styles.optionsColumn}>
                        <Text style={styles.sectionTitle}>Tamanhos</Text>

                        <View style={styles.sizeContainer}>
                            {selectedVariant?.skus?.map((sku: Sku) => {
                                const isSelected = selectedSku?.id === sku.id;

                                return (
                                    <Pressable
                                        key={sku.id}
                                        style={[
                                            styles.sizeButton,
                                            isSelected && styles.sizeButtonSelected,
                                        ]}
                                        onPress={() => setSelectedSku(sku)}
                                    >
                                        <Text
                                            style={[
                                                styles.sizeButtonText,
                                                isSelected && styles.sizeButtonTextSelected,
                                            ]}
                                        >
                                            {sku.size ?? 'U'}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>

                    {/* CORES */}
                    <View style={styles.optionsColumn}>
                        <Text style={styles.sectionTitle}>Cores</Text>

                        <View style={styles.colorContainer}>
                            {product.variants?.map((variant) => {
                                const isSelected = selectedVariant?.id === variant.id;

                                return (
                                    <Pressable
                                        key={variant.id}
                                        style={styles.colorItem}
                                        onPress={() => {
                                            setSelectedVariant(variant);
                                            setSelectedSku(variant.skus?.[0] || null);
                                        }}
                                    >
                                        <View style={styles.colorWrapper}>
                                            <View
                                                style={[
                                                    styles.colorCircle,
                                                    {
                                                        backgroundColor:
                                                            colorMap[variant.color] || '#D1D5DB',
                                                    },
                                                ]}
                                            />

                                            {isSelected && <View style={styles.colorRing} />}
                                        </View>

                                        <Text style={styles.colorName}>
                                            {variant.color}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>

                </View>

            </ScrollView>

            {/* FOOTER */}
            <View style={styles.footer}>

                <View style={styles.quantitySection}>
                    <View style={styles.quantityBox}>
                        <Pressable
                            style={styles.quantityBtn}
                            onPress={() => setQuantity(q => Math.max(1, q - 1))}
                        >
                            <Text style={styles.quantityBtnText}>−</Text>
                        </Pressable>

                        <Text style={styles.quantityValue}>{quantity}</Text>

                        <Pressable
                            style={styles.quantityBtn}
                            onPress={() => setQuantity(q => q + 1)}
                        >
                            <Text style={styles.quantityBtnText}>+</Text>
                        </Pressable>
                    </View>

                    <View style={styles.totalBox}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>
                            R$ {((selectedSku?.price ?? 0) * quantity).toFixed(2)}
                        </Text>
                    </View>
                </View>

                <Button
                    mode="contained"
                    disabled={!selectedSku}
                    onPress={handleAddToCart}
                    style={styles.button}
                    labelStyle={styles.buttonLabel}
                >
                    Adicionar ao carrinho
                </Button>

            </View>

            {/* MODAL */}
            <Portal>
                <Modal
                    visible={showModal}
                    onDismiss={() => setShowModal(false)}
                    contentContainerStyle={styles.modalContainer}
                >
                    <Text style={styles.modalTitle}>
                        Produto adicionado ao carrinho!
                    </Text>

                    <Text style={styles.modalSubtitle}>
                        O que você deseja fazer agora?
                    </Text>

                    <View style={styles.modalButtons}>

                        <Button
                            mode="contained"
                            onPress={() => {
                                setShowModal(false);
                                router.push('/order/cart/cart');
                            }}
                        >
                            Ir para o carrinho
                        </Button>

                        <Button
                            mode="outlined"
                            onPress={() => setShowModal(false)}
                        >
                            Continuar comprando
                        </Button>

                    </View>
                </Modal>
            </Portal>

        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },

    content: {
        padding: 16,
        paddingBottom: 100,
    },

    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    image: {
        width: '100%',
        height: 280,
        borderRadius: 12,
        marginBottom: 16,
    },

    name: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 8,
    },

    description: {
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 12,
        lineHeight: 24,
    },

    price: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 16,
    },

    /* LAYOUT */
    optionsRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 24,
        paddingHorizontal: 4,
    },

    optionsColumn: {
        flex: 1,
    },

    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
    },

    /* TAMANHOS */
    sizeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },

    sizeButton: {
        minWidth: 44,
        height: 44,
        borderRadius: 10,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },

    sizeButtonSelected: {
        backgroundColor: '#000',
        borderColor: '#000',
    },

    sizeButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },

    sizeButtonTextSelected: {
        color: '#FFF',
    },

    /* CORES */
    colorContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },

    colorItem: {
        alignItems: 'center',
        gap: 6,
    },

    colorWrapper: {
        width: 46,
        height: 46,
        justifyContent: 'center',
        alignItems: 'center',
    },

    colorCircle: {
        width: 42,
        height: 42,
        borderRadius: 21,
        borderWidth: 2,
        borderColor: 'black',
        position: 'absolute',
    },

    colorRing: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: '#000',
        position: 'absolute',
    },

    colorName: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
    },

    /* FOOTER */
    footer: {
        borderTopWidth: 1,
        borderColor: '#E5E7EB',
        paddingTop: 5,
        paddingHorizontal: 16,
        paddingBottom: 38,
        backgroundColor: '#F3F4F6',
        elevation: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: -12 },
    },

    quantitySection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },

    quantityBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 8,
        gap: 10,
    },

    quantityBtn: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },

    quantityBtnText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
    },

    quantityValue: {
        fontSize: 16,
        fontWeight: '600',
        minWidth: 26,
        textAlign: 'center',
    },

    totalBox: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 10,
        alignItems: 'center',
    },

    totalLabel: {
        fontSize: 12,
        color: '#000',
        marginBottom: 4,
    },

    totalValue: {
        fontSize: 18,
        fontWeight: '700',
    },

    button: {
        borderRadius: 12,
        paddingVertical: 6,
    },

    buttonLabel: {
        fontSize: 18,
        fontWeight: '700',
    },


    modalContainer: {
        backgroundColor: '#FFF',
        padding: 20,
        marginHorizontal: 20,
        borderRadius: 16,
        alignItems: 'center',
    },

    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
    },

    modalSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 20,
        textAlign: 'center',
    },

    modalButtons: {
        width: '100%',
        gap: 10,
    },
});