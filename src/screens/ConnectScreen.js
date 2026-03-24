import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { theme } from '../theme';

const MOCK_USERS = [
  { id: '1', name: 'Carlos M.', activityType: 'surfer', distance: 0.3, bio: 'Dawn patrol regular. Looking for surf buddies in Tarifa.' },
  { id: '2', name: 'Leila K.', activityType: 'gym', distance: 1.2, bio: 'Powerlifter. Training at McFit this week.' },
  { id: '3', name: 'Tom B.', activityType: 'outdoor', distance: 0.8, bio: 'Trail runner exploring the coast. Always up for a morning run.' },
  { id: '4', name: 'Aisha R.', activityType: 'surfer', distance: 2.1, bio: 'Kite surfer passing through. Here for the wind!' },
  { id: '5', name: 'Marco P.', activityType: 'gym', distance: 0.5, bio: 'Calisthenics and mobility work. Hit me up for a park session.' },
];

const FILTERS = ['all', 'surfer', 'gym', 'outdoor'];
const ACTIVITY_ICONS = { surfer: '🏄', gym: '🏋️', outdoor: '🏃' };

export default function ConnectScreen() {
  const [filter, setFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const filtered = filter === 'all' ? MOCK_USERS : MOCK_USERS.filter(u => u.activityType === filter);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Connect</Text>

      <View style={styles.filterBar}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>👀</Text>
            <Text style={styles.emptyTitle}>No users nearby</Text>
            <Text style={styles.emptySubtitle}>Try changing your filter or pull to refresh.</Text>
          </View>
        ) : (
          filtered.map(user => (
            <View key={user.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>{ACTIVITY_ICONS[user.activityType]}</Text>
                <View style={styles.cardMeta}>
                  <Text style={styles.cardName}>{user.name}</Text>
                  <Text style={styles.cardDistance}>{user.distance} km away</Text>
                </View>
              </View>
              <Text style={styles.cardBio}>{user.bio}</Text>
              <TouchableOpacity style={styles.connectBtn} onPress={() => setSelectedUser(user)}>
                <Text style={styles.connectBtnText}>Connect</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={!!selectedUser} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedUser && (
              <>
                <Text style={styles.modalIcon}>{ACTIVITY_ICONS[selectedUser.activityType]}</Text>
                <Text style={styles.modalName}>{selectedUser.name}</Text>
                <Text style={styles.modalBio}>{selectedUser.bio}</Text>
                <Text style={styles.modalDistance}>{selectedUser.distance} km away</Text>
                <TouchableOpacity style={styles.messageBtn}>
                  <Text style={styles.messageBtnText}>Send Message</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedUser(null)}>
                  <Text style={styles.closeBtnText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  filterBtn: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.pill,
    backgroundColor: theme.colors.surface,
  },
  filterBtnActive: {
    backgroundColor: theme.colors.text,
  },
  filterText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textSecondary,
  },
  filterTextActive: {
    color: theme.colors.background,
  },
  list: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxxl,
    gap: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  cardIcon: {
    fontSize: theme.fontSize.xxl,
    marginRight: theme.spacing.md,
  },
  cardMeta: {
    flex: 1,
  },
  cardName: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  cardDistance: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textTertiary,
  },
  cardBio: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
  connectBtn: {
    backgroundColor: theme.colors.text,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  connectBtnText: {
    color: theme.colors.background,
    fontWeight: theme.fontWeight.semibold,
    fontSize: theme.fontSize.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  emptyTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.modalOverlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.xxl,
    alignItems: 'center',
    paddingBottom: 40,
  },
  modalIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  modalName: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  modalBio: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
    lineHeight: 20,
  },
  modalDistance: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textTertiary,
    marginBottom: theme.spacing.xl,
  },
  messageBtn: {
    backgroundColor: theme.colors.text,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xxxl,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    width: '100%',
    alignItems: 'center',
  },
  messageBtnText: {
    color: theme.colors.background,
    fontWeight: theme.fontWeight.semibold,
    fontSize: theme.fontSize.lg,
  },
  closeBtn: {
    paddingVertical: theme.spacing.md,
  },
  closeBtnText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
  },
});
