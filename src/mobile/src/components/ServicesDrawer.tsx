import { useRouter, type Href } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Drawer, Modal, Portal, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing } from '@/src/theme';

type Props = {
  visible: boolean;
  onDismiss: () => void;
};

// Slide-in panel built on Paper Portal+Modal (no @react-navigation/drawer dep).
// Lists admin "services"; Estoque is the only one wired today.
export function ServicesDrawer({ visible, onDismiss }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const go = (pathname: Href) => {
    onDismiss();
    router.push(pathname);
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        style={styles.modal}
        contentContainerStyle={[styles.panel, { paddingTop: insets.top + spacing.md }]}
      >
        <View style={styles.header}>
          <Text variant="labelSmall">MENU</Text>
          <Text variant="titleLarge">Serviços</Text>
        </View>

        <Drawer.Section showDivider={false}>
          <Drawer.Item
            icon="warehouse"
            label="Estoque"
            onPress={() => go('/stock')}
          />
        </Drawer.Section>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  // Anchor the modal content to the left edge instead of centering it.
  modal: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    margin: 0,
  },
  panel: {
    width: 210,
    // flex:1 fills full screen height; justifyContent overrides Paper's
    // styles.content (justifyContent:'center') which was centering the items.
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: '#ffffff',
    paddingHorizontal: spacing.sm,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
});
