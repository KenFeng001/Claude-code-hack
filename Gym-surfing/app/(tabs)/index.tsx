import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';

const FILTERS = ['All', 'Gyms', 'Healthy Food', 'Saved', 'Buddies'];
const FILTER_COLORS: Record<string, { bg: string; color: string }> = {
  All:            { bg: '#FFFFFF', color: '#000000' },
  Gyms:           { bg: '#D58085', color: '#000000' },
  'Healthy Food': { bg: '#8CB4D6', color: '#000000' },
  Saved:          { bg: '#333333', color: '#FFFFFF' },
  Buddies:        { bg: '#333333', color: '#FFFFFF' },
};

const MAP_MARKERS = [
  { id: 'gym1', lat: 51.508, lng: -0.11, type: 'gym', title: 'Iron Temple Gym' },
  { id: 'gym2', lat: 51.503, lng: -0.08, type: 'gym', title: 'PureGym City' },
  { id: 'food1', lat: 51.51, lng: -0.095, type: 'food', title: 'Green Bowl' },
  { id: 'food2', lat: 51.498, lng: -0.085, type: 'food', title: 'Protein Haus' },
];

const INITIAL_REGION = {
  latitude: 51.505,
  longitude: -0.09,
  latitudeDelta: 0.025,
  longitudeDelta: 0.025,
};

export default function HomeScreen() {
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredMarkers = MAP_MARKERS.filter((m) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Gyms') return m.type === 'gym';
    if (activeFilter === 'Healthy Food') return m.type === 'food';
    return true;
  });

  return (
    <View style={styles.container}>
      {/* ── LIVE MAP ── */}
      <MapView
        style={StyleSheet.absoluteFillObject}
        provider={PROVIDER_DEFAULT}
        initialRegion={INITIAL_REGION}
        showsUserLocation
        showsMyLocationButton={false}
        userInterfaceStyle="dark"
        customMapStyle={darkMapStyle}
      >
        {filteredMarkers.map((m) => (
          <Marker
            key={m.id}
            coordinate={{ latitude: m.lat, longitude: m.lng }}
            title={m.title}
          >
            <View style={[styles.marker, m.type === 'gym' ? styles.markerGym : styles.markerFood]}>
              <Text style={{ fontSize: 10 }}>{m.type === 'gym' ? '🏋️' : '🥗'}</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* ── UI LAYER ── */}
      <View style={styles.uiLayer} pointerEvents="box-none">

        {/* TOP SECTION */}
        <View style={styles.topSection} pointerEvents="box-none">
          <View style={styles.topRow}>
            <Pressable style={styles.iconPill}>
              <Text style={styles.iconPillText}>☰</Text>
            </Pressable>
            <View style={styles.weatherWidget}>
              <Text style={{ fontSize: 16 }}>☁️</Text>
              <Text style={styles.weatherTemp}>18°</Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContent}
          >
            {FILTERS.map((f) => {
              const isActive = activeFilter === f;
              const isBordered = f === 'Saved' || f === 'Buddies';
              return (
                <Pressable
                  key={f}
                  onPress={() => setActiveFilter(f)}
                  style={[
                    styles.filterTag,
                    {
                      backgroundColor: isActive ? FILTER_COLORS[f].bg : '#333333',
                      borderWidth: isBordered && !isActive ? 1 : 0,
                      borderColor: 'rgba(255,255,255,0.1)',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterTagText,
                      { color: isActive ? FILTER_COLORS[f].color : '#FFFFFF' },
                    ]}
                  >
                    {f}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* BOTTOM SCHEDULE PANEL */}
        <View style={styles.panel}>
          <View style={styles.widgetHeader}>
            <View>
              <Text style={styles.widgetTitle}>Schedule</Text>
              <Text style={styles.widgetSubtitle}>2 sessions this week</Text>
            </View>
            <Pressable style={styles.addBtn}>
              <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '300', marginTop: -2 }}>+</Text>
            </Pressable>
          </View>

          <View style={styles.bookingCard}>
            <View style={styles.bookingMain}>
              <View style={{ gap: 4 }}>
                <Text style={styles.bookingPlace}>Iron Temple Gym</Text>
                <View style={styles.bookingTimeRow}>
                  <View style={styles.statusDot} />
                  <Text style={styles.bookingTime}>Today, 18:00</Text>
                </View>
              </View>
              <View style={styles.avatarGroup}>
                <View style={[styles.avatar, { zIndex: 2 }]}>
                  <Text style={{ fontSize: 14 }}>👨🏽</Text>
                </View>
                <View style={[styles.avatar, { marginLeft: -12, zIndex: 1 }]}>
                  <Text style={{ fontSize: 14 }}>👱🏼‍♀️</Text>
                </View>
              </View>
            </View>

            <View style={styles.cardActions}>
              <Pressable style={styles.btnPrimary}>
                <Text style={styles.btnPrimaryText}>Directions</Text>
              </Pressable>
              <Pressable style={styles.btnSecondary}>
                <Text style={{ fontSize: 16 }}>💬</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.upcomingSection}>
            <Text style={styles.upcomingLabel}>UPCOMING</Text>
            <View style={styles.upcomingItem}>
              <View style={styles.upcomingIcon}>
                <Text style={{ fontSize: 16 }}>☕</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.upcomingTitle}>Post-workout meal</Text>
                <Text style={styles.upcomingSub}>Green Bowl · Tomorrow, 19:30</Text>
              </View>
            </View>
          </View>
        </View>

      </View>
    </View>
  );
}

// Google Maps dark style JSON
const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#111114' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#111114' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#555555' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a1a1f' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#252525' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#222228' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0a0a0e' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#151518' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#1a1a1f' }] },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },

  // Markers
  marker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#191919',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  markerGym: { backgroundColor: '#D58085' },
  markerFood: { backgroundColor: '#8CB4D6' },

  // UI Layer
  uiLayer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },

  // Top Section
  topSection: { gap: 16 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconPill: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#191919',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  iconPillText: { color: '#FFFFFF', fontSize: 18 },
  weatherWidget: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 9999,
    backgroundColor: '#191919',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  weatherTemp: { fontSize: 15, fontWeight: '600', color: '#FFFFFF', letterSpacing: -0.2 },

  // Filters
  filtersContent: { gap: 10 },
  filterTag: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 9999 },
  filterTagText: { fontSize: 14, fontWeight: '600', letterSpacing: -0.2 },

  // Bottom Panel
  panel: {
    backgroundColor: '#191919',
    borderRadius: 32,
    padding: 24,
    gap: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -20 },
    shadowOpacity: 0.6,
    shadowRadius: 40,
    elevation: 20,
  },
  widgetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  widgetTitle: { fontSize: 24, fontWeight: '700', color: '#FFFFFF', letterSpacing: -0.5 },
  widgetSubtitle: { fontSize: 13, color: '#8E8E93', marginTop: 2, fontWeight: '500' },
  addBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#252525', justifyContent: 'center', alignItems: 'center',
  },

  // Booking Card
  bookingCard: { backgroundColor: '#252525', borderRadius: 24, padding: 16 },
  bookingMain: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  bookingPlace: { fontSize: 14, color: '#8E8E93', fontWeight: '500' },
  bookingTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: '#4CD964',
    shadowColor: '#4CD964', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 10,
  },
  bookingTime: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', letterSpacing: -0.5 },
  avatarGroup: { flexDirection: 'row' },
  avatar: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#333333',
    borderWidth: 2, borderColor: '#252525', justifyContent: 'center', alignItems: 'center',
  },
  cardActions: { marginTop: 20, flexDirection: 'row', gap: 12, alignItems: 'center' },
  btnPrimary: { flex: 1, backgroundColor: '#FF8A00', borderRadius: 9999, paddingVertical: 10, alignItems: 'center' },
  btnPrimaryText: { color: '#000000', fontSize: 14, fontWeight: '600', letterSpacing: -0.2 },
  btnSecondary: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 9999, paddingHorizontal: 16, paddingVertical: 10 },

  // Upcoming
  upcomingSection: { gap: 12 },
  upcomingLabel: { fontSize: 13, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '600', marginLeft: 4 },
  upcomingItem: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 4, paddingHorizontal: 4 },
  upcomingIcon: { width: 40, height: 40, borderRadius: 16, backgroundColor: '#252525', justifyContent: 'center', alignItems: 'center' },
  upcomingTitle: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  upcomingSub: { fontSize: 13, color: '#8E8E93', marginTop: 2 },
});
