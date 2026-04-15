import React, { useState } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
} from "react-native";
import { COLORS, SIZES, SHADOWS } from "../constants/theme";
import { SUCCESS_STORIES } from "../constants/dummyData";

const ALL_STORIES = [
  ...SUCCESS_STORIES,
  {
    id: "s4",
    name: "Mohammed Farhan",
    avatar: "MF",
    avatarColor: "#DC2626",
    company: "Capgemini",
    story: "Testing wasn't even on my radar. NCPL opened my eyes to the world of QA. Now I'm a QA Engineer at Capgemini and loving every bit of it!",
    batch: "2022",
    likes: 76,
  },
  {
    id: "s5",
    name: "Kiran Babu",
    avatar: "KB",
    avatarColor: "#0891B2",
    company: "Tech Mahindra",
    story: "Built my first Android app during NCPL training. Six months later, I was an Android developer at Tech Mahindra. The hands-on projects make all the difference.",
    batch: "2023",
    likes: 143,
  },
];

export default function StoriesScreen() {
  const [likedStories, setLikedStories] = useState([]);

  const toggleLike = (id) => {
    setLikedStories(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Success Stories</Text>
        <Text style={styles.headerSub}>Real journeys from NCPL to dream jobs 🌟</Text>
      </View>

      <View style={styles.banner}>
        <Text style={styles.bannerEmoji}>🏆</Text>
        <View>
          <Text style={styles.bannerTitle}>120+ Alumni Placed</Text>
          <Text style={styles.bannerSub}>Across 45+ top companies nationwide</Text>
        </View>
      </View>

      <FlatList
        data={ALL_STORIES}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.quoteIcon}>"</Text>
            <Text style={styles.storyText}>{item.story}</Text>
            <View style={styles.authorRow}>
              <View style={[styles.avatar, { backgroundColor: item.avatarColor }]}>
                <Text style={styles.avatarText}>{item.avatar}</Text>
              </View>
              <View style={styles.authorInfo}>
                <Text style={styles.authorName}>{item.name}</Text>
                <Text style={styles.authorMeta}>{item.company} · Batch {item.batch}</Text>
              </View>
              <View style={styles.companyBadge}>
                <Text style={styles.companyBadgeText}>✓ Placed</Text>
              </View>
            </View>
            <View style={styles.footer}>
              <TouchableOpacity style={styles.likeBtn} onPress={() => toggleLike(item.id)}>
                <Text style={styles.likeIcon}>{likedStories.includes(item.id) ? "❤️" : "🤍"}</Text>
                <Text style={[styles.likeText, likedStories.includes(item.id) && { color: "#EF4444" }]}>
                  {likedStories.includes(item.id) ? item.likes + 1 : item.likes} helpful
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.primary, paddingTop: 55, paddingBottom: 24, paddingHorizontal: 20 },
  headerTitle: { fontSize: SIZES.xxl, fontWeight: "800", color: COLORS.white },
  headerSub: { fontSize: SIZES.sm, color: "rgba(255,255,255,0.75)", marginTop: 4 },
  banner: { backgroundColor: COLORS.secondary, flexDirection: "row", alignItems: "center", padding: 16, gap: 12 },
  bannerEmoji: { fontSize: 32 },
  bannerTitle: { fontSize: SIZES.lg, fontWeight: "800", color: COLORS.primary },
  bannerSub: { fontSize: SIZES.sm, color: COLORS.primary + "90", marginTop: 2 },
  card: { backgroundColor: COLORS.white, borderRadius: 18, padding: 20, marginBottom: 14, ...SHADOWS.small, borderLeftWidth: 4, borderLeftColor: COLORS.primary },
  quoteIcon: { fontSize: 48, color: COLORS.primary + "20", fontWeight: "900", lineHeight: 48, marginBottom: -8 },
  storyText: { fontSize: SIZES.md, color: COLORS.text, lineHeight: 24, fontStyle: "italic", marginBottom: 16 },
  authorRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingTop: 14, borderTopWidth: 1, borderTopColor: COLORS.border },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  authorInfo: { flex: 1 },
  authorName: { fontSize: SIZES.sm, fontWeight: "700", color: COLORS.text },
  authorMeta: { fontSize: SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
  companyBadge: { backgroundColor: COLORS.success + "18", borderRadius: 8, paddingVertical: 3, paddingHorizontal: 8 },
  companyBadgeText: { fontSize: SIZES.xs, color: COLORS.success, fontWeight: "600" },
  footer: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  likeBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  likeIcon: { fontSize: 16 },
  likeText: { fontSize: SIZES.sm, color: COLORS.textSecondary, fontWeight: "500" },
});