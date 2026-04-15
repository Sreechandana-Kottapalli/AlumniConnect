import React from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from "react-native";
import { COLORS, SIZES, SHADOWS } from "../constants/theme";
import { ALUMNI, SUCCESS_STORIES } from "../constants/dummyData";

const CURRENT_USER = {
  name: "Deepika Nair",
  role: "trainee",
  batch: "2024",
  domain: "Web Development",
  avatar: "DN",
  avatarColor: "#7C3AED",
};

export default function HomeScreen({ navigation }) {
  const availableAlumni = ALUMNI.filter(a => a.available).slice(0, 4);
  const stats = [
    { label: "Alumni", value: "120+", icon: "🎓" },
    { label: "Trainees", value: "340+", icon: "📚" },
    { label: "Companies", value: "45+", icon: "🏢" },
    { label: "Placed", value: "98%", icon: "✅" },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.banner}>
        <View style={styles.bannerContent}>
          <View style={styles.userInfo}>
            <View style={[styles.avatar, { backgroundColor: CURRENT_USER.avatarColor }]}>
              <Text style={styles.avatarText}>{CURRENT_USER.avatar}</Text>
            </View>
            <View>
              <Text style={styles.greeting}>Hello, {CURRENT_USER.name.split(" ")[0]} 👋</Text>
              <Text style={styles.roleText}>📚 Trainee · Batch {CURRENT_USER.batch}</Text>
            </View>
          </View>
        </View>
        <View style={styles.bannerCard}>
          <Text style={styles.bannerCardTitle}>Find your mentor today</Text>
          <Text style={styles.bannerCardSub}>Connect with placed alumni from your domain.</Text>
          <TouchableOpacity
            style={styles.bannerCardBtn}
            onPress={() => navigation.navigate("Alumni")}>
            <Text style={styles.bannerCardBtnText}>Browse Alumni →</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsRow}>
        {stats.map((s, i) => (
          <View key={i} style={styles.statCard}>
            <Text style={styles.statIcon}>{s.icon}</Text>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {[
            { icon: "🔍", label: "Find Mentor", screen: "Alumni" },
            { icon: "🌟", label: "Success Stories", screen: "Stories" },
            { icon: "🤖", label: "AI Assistant", screen: "AI" },
            { icon: "👤", label: "My Profile", screen: "Profile" },
          ].map((action, i) => (
            <TouchableOpacity
              key={i}
              style={styles.actionCard}
              onPress={() => navigation.navigate(action.screen)}>
              <Text style={styles.actionIcon}>{action.icon}</Text>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Alumni</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Alumni")}>
            <Text style={styles.seeAll}>See All →</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {availableAlumni.map(alumni => (
            <TouchableOpacity
              key={alumni.id}
              style={styles.alumniCard}
              onPress={() => navigation.navigate("AlumniDetail", { alumni })}>
              <View style={[styles.alumniAvatar, { backgroundColor: alumni.avatarColor }]}>
                <Text style={styles.alumniAvatarText}>{alumni.avatar}</Text>
              </View>
              <Text style={styles.alumniName} numberOfLines={1}>{alumni.name}</Text>
              <Text style={styles.alumniCompany} numberOfLines={1}>{alumni.company}</Text>
              <View style={styles.batchChip}>
                <Text style={styles.batchChipText}>Batch {alumni.batch}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Success Stories</Text>
        {SUCCESS_STORIES.slice(0, 2).map(story => (
          <View key={story.id} style={styles.storyCard}>
            <View style={styles.storyHeader}>
              <View style={[styles.storyAvatar, { backgroundColor: story.avatarColor }]}>
                <Text style={styles.storyAvatarText}>{story.avatar}</Text>
              </View>
              <View>
                <Text style={styles.storyName}>{story.name}</Text>
                <Text style={styles.storyCompany}>📍 {story.company} · Batch {story.batch}</Text>
              </View>
            </View>
            <Text style={styles.storyText} numberOfLines={3}>"{story.story}"</Text>
          </View>
        ))}
      </View>
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  banner: { backgroundColor: COLORS.primary, padding: 20, paddingTop: 50, paddingBottom: 30, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  bannerContent: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  userInfo: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "rgba(255,255,255,0.5)" },
  avatarText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  greeting: { color: COLORS.white, fontSize: SIZES.lg, fontWeight: "700" },
  roleText: { color: "rgba(255,255,255,0.75)", fontSize: SIZES.xs, marginTop: 2 },
  bannerCard: { backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  bannerCardTitle: { color: COLORS.white, fontSize: SIZES.lg, fontWeight: "700", marginBottom: 4 },
  bannerCardSub: { color: "rgba(255,255,255,0.75)", fontSize: SIZES.sm, marginBottom: 12 },
  bannerCardBtn: { alignSelf: "flex-start", backgroundColor: COLORS.secondary, borderRadius: 99, paddingVertical: 6, paddingHorizontal: 14 },
  bannerCardBtnText: { color: COLORS.primary, fontSize: SIZES.sm, fontWeight: "700" },
  statsRow: { flexDirection: "row", marginHorizontal: 16, marginTop: -20, backgroundColor: COLORS.white, borderRadius: 16, padding: 12, ...SHADOWS.medium, gap: 4 },
  statCard: { flex: 1, alignItems: "center", paddingVertical: 6 },
  statIcon: { fontSize: 18, marginBottom: 4 },
  statValue: { fontSize: SIZES.base, fontWeight: "800", color: COLORS.primary },
  statLabel: { fontSize: SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  sectionTitle: { fontSize: SIZES.lg, fontWeight: "700", color: COLORS.text, marginBottom: 14 },
  seeAll: { fontSize: SIZES.sm, color: COLORS.primary, fontWeight: "600" },
  actionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  actionCard: { width: "47%", backgroundColor: COLORS.white, borderRadius: 14, padding: 16, alignItems: "center", ...SHADOWS.small },
  actionIcon: { fontSize: 28, marginBottom: 8 },
  actionLabel: { fontSize: SIZES.sm, fontWeight: "600", color: COLORS.text },
  alumniCard: { width: 140, backgroundColor: COLORS.white, borderRadius: 16, padding: 14, marginRight: 10, alignItems: "center", ...SHADOWS.small },
  alumniAvatar: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  alumniAvatarText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  alumniName: { fontSize: SIZES.sm, fontWeight: "700", color: COLORS.text, textAlign: "center" },
  alumniCompany: { fontSize: SIZES.xs, color: COLORS.textSecondary, marginTop: 2, textAlign: "center" },
  batchChip: { marginTop: 8, backgroundColor: COLORS.primary + "15", borderRadius: 99, paddingVertical: 3, paddingHorizontal: 8 },
  batchChipText: { fontSize: SIZES.xs, color: COLORS.primary, fontWeight: "600" },
  storyCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 16, marginBottom: 12, ...SHADOWS.small },
  storyHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  storyAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  storyAvatarText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  storyName: { fontSize: SIZES.md, fontWeight: "700", color: COLORS.text },
  storyCompany: { fontSize: SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
  storyText: { fontSize: SIZES.sm, color: COLORS.textSecondary, fontStyle: "italic", lineHeight: 20 },
});