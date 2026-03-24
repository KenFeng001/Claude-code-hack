import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type Conversation = {
  id: number;
  name: string;
  emoji: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
};

const CONVERSATIONS: Conversation[] = [
  { id: 1, name: 'Alex M.', emoji: '🧔', lastMessage: 'See you at PureGym at 7am! 💪', time: '2m ago', unread: 2, online: true },
  { id: 2, name: 'Priya K.', emoji: '👩', lastMessage: 'That cardio session was intense!', time: '15m ago', unread: 0, online: true },
  { id: 3, name: 'Jordan T.', emoji: '🧑', lastMessage: 'Can we reschedule to Thursday?', time: '1h ago', unread: 1, online: false },
  { id: 4, name: 'Sam W.', emoji: '🧑‍🦱', lastMessage: 'New PR on deadlift today 🎉', time: '3h ago', unread: 0, online: true },
  { id: 5, name: 'Maya R.', emoji: '👩‍🦰', lastMessage: 'Thanks for the spot!', time: '5h ago', unread: 0, online: false },
  { id: 6, name: 'Chris D.', emoji: '🧑‍🦲', lastMessage: 'Which protein powder do you use?', time: 'Yesterday', unread: 0, online: false },
  { id: 7, name: 'Lena B.', emoji: '👩‍🦳', lastMessage: 'Great workout today!', time: 'Yesterday', unread: 0, online: false },
  { id: 8, name: 'Omar F.', emoji: '🧔‍♂️', lastMessage: 'Let me know when you want to train legs', time: '2d ago', unread: 0, online: false },
];

export default function MessagesScreen() {
  const unreadCount = CONVERSATIONS.filter(c => c.unread > 0).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <View style={styles.countPill}>
          <Text style={styles.countText}>{unreadCount} unread</Text>
        </View>
      </View>

      <FlatList
        data={CONVERSATIONS}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [
              styles.messageItem,
              pressed && { backgroundColor: '#252525' },
            ]}
          >
            <View style={styles.avatarWrap}>
              <View style={styles.avatar}>
                <Text style={styles.avatarEmoji}>{item.emoji}</Text>
              </View>
              {item.online && <View style={styles.onlineDot} />}
            </View>

            <View style={styles.messageContent}>
              <View style={styles.messageTopRow}>
                <Text style={styles.messageName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.messageTime}>{item.time}</Text>
              </View>
              <Text style={styles.messagePreview} numberOfLines={1}>
                {item.lastMessage}
              </Text>
            </View>

            {item.unread > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{item.unread}</Text>
              </View>
            )}
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  countPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#191919',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
  },

  list: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  messageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#191919',
    marginBottom: 8,
  },

  avatarWrap: { position: 'relative' },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#252525',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: { fontSize: 22 },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CD964',
    borderWidth: 2,
    borderColor: '#191919',
  },

  messageContent: { flex: 1, gap: 4 },
  messageTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 8,
  },
  messageTime: {
    fontSize: 12,
    color: '#555',
  },
  messagePreview: {
    fontSize: 13,
    color: '#8E8E93',
  },

  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FF8A00',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000',
  },
});
