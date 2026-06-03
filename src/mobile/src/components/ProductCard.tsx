import { Image } from 'expo-image';
import { useState } from 'react';
import { View } from 'react-native';
import { Card, Icon, Text, useTheme } from 'react-native-paper';

import { resolveImageUri } from '@/shared/helpers';
import type { Product } from '@/src/types/catalog';

import { styles } from './ProductCard.styles';

const PRICE_FORMATTER = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

function minPrice(product: Product): number | null {
  const prices = (product.variants ?? [])
    .flatMap((v) => v.skus ?? [])
    .map((s) => s.price)
    .filter((p): p is number => typeof p === 'number');
  return prices.length ? Math.min(...prices) : null;
}

type Props = {
  product: Product;
  onPress?: (product: Product) => void;
};

export function ProductCard({ product, onPress }: Props) {
  const theme = useTheme();
  const price = minPrice(product);
  const imageUri = resolveImageUri(product.urlImg);
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = imageUri && !imageFailed;

  return (
    <Card
      mode="outlined"
      style={styles.card}
      onPress={onPress ? () => onPress(product) : undefined}
    >
      <View style={[styles.imageWrap, { backgroundColor: theme.colors.surfaceVariant }]}>
        {showImage ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            contentFit="cover"
            transition={200}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <View style={styles.placeholder}>
            <Icon source="image-off-outline" size={48} color={theme.colors.outline} />
          </View>
        )}
      </View>

      <Card.Content style={styles.body}>
        {product.category?.name ? (
          <Text variant="labelSmall" numberOfLines={1}>
            {product.category.name.toUpperCase()}
          </Text>
        ) : null}
        <Text variant="titleSmall" numberOfLines={2}>
          {product.name}
        </Text>
        <Text variant="labelLarge" style={styles.price}>
          {price !== null
            ? `A partir de ${PRICE_FORMATTER.format(price)}`
            : 'Indisponível'}
        </Text>
      </Card.Content>
    </Card>
  );
}
