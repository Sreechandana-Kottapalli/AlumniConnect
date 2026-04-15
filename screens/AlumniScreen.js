import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, FlatList, ScrollView,
} from "react-native";
import { COLORS, SIZES, SHADOWS } from "../constants/theme";
import { ALUMNI, DOMAINS, BATCHES } from "../constants/dummyData";

export default function AlumniScreen({ navigation }) {
  const [search, setSearch] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("All");
  const [selectedBatch, setSelectedBatch] = useState("All");

  const filtered = ALUMNI.filter(a => {
    const matchSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.company.toLowerCase().includes(search.toLowerCase()) ||
      a.domain.toLowerCase().includes(search.toLowerCase());
    const matchDomain = selectedDomain === "All" || a.domain === selectedDomain;
    const matchBatch = selectedBatch === "All" || a.batch === selectedBatch;
    return matchSearch && matchDomain && matchBatch;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Browse Alumni</Text>
        <Text style={styles.headerSub}>{filtered.length} mentors found</Text>
      </View>

      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, company, domain..."
          placeholderTextColor={COLORS.textLight}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {DOMAINS.map(d => (
          <TouchableOpacity
            key={d}
            style={[styles.filterChip, selectedDomain === d && styles.filterChipActive]}
            onPress={() => setSelectedDomain(d)}>
            <Text style={[styles.filterChipText, selectedDomain === d && styles.filterChipTextActive]}>
              {d}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        style={[styles.filterScroll, { marginTop: 6 }]}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {BATCHES.map(b => (
          <TouchableOpacity
            key={b}
            style={[styles.filterChip, selectedBatch === b && styles.batchChipActive]}
            onPress={() => setSelectedBatch(b)}>
            <Text style={[styles.filterChipText, selectedBatch === b && { color: COLORS.primary, fontWeight: "700" }]}>
              {b === "All" ? "All Batches" : `Batch ${b}`}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("AlumniDetail", { alumni: item })}
            activeOpacity={0.85}>
            <View style={[styles.cardAvatar, { backgroundColor: item.avatarColor }]}>
              <Text style={styles.cardAvatarText}>{item.avatar}</Text>
            </View>
            <View style={styles.cardBody}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.cardName}>{item.name}</Text>
                <View style={[styles.availChip, !item.available && styles.availChipGray]}>
                  <Text style={[styles.availChipText, !item.available && { color: COLORS.textLight }]}>
                    {item.available ? "Available" : "Busy"}
                  </Text>
                </View>
              </View>
              <Text style={styles.cardDesig}>{item.designation} at {item.company}</Text>
              <Text style={styles.cardDomain}>{item.domain}</Text>
              <View style={styles.cardMeta}>
                <Text style={styles.metaText}>📅 Batch {item.batch}</Text>
                <Text style={styles.metaText}>📍 {item.location}</Text>
              </View>
              <View style={styles.skillsRow}>
                {item.skills.slice(0, 3).map(skill => (
                  <View key={skill} style={styles.skillChip}>
                    <Text style={styles.skillChipText}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>No alumni found</Text>
            <Text style={styles.emptySub}>Try adjusting your filters</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.primary, paddingTop: 55, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { fontSize: SIZES.xxl, fontWeight: "800", color: COLORS.white },
  headerSub: { fontSize: SIZES.sm, color: "rgba(255,255,255,0.7)", marginTop: 4 },
  searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.white, marginHorizontal: 16, marginTop: -18, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4, ...SHADOWS.medium, gap: 8 },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: SIZES.md, color: COLORS.text, paddingVertical: 12 },
  filterScroll: { marginTop: 12, maxHeight: 50 },
  filterChip: { paddingVertical: 7, paddingHorizontal: 14, borderRadius: 99, backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: COLORS.border, marginRight: 8, height: 36, justifyContent: "center", alignItems: "center", },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterChipText: { fontSize: SIZES.sm, 
  color: COLORS.textSecondary, 
  fontWeight: "500",
  whiteSpace: "nowrap", },
  filterChipTextActive: { color: COLORS.white, fontWeight: "600" },
  batchChipActive: { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary, },
  card: { backgroundColor: COLORS.white, borderRadius: 16, padding: 14, marginBottom: 12, flexDirection: "row", gap: 12, ...SHADOWS.small },
  cardAvatar: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  cardAvatarText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  cardBody: { flex: 1 },
  cardTitleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardName: { fontSize: SIZES.md, fontWeight: "700", color: COLORS.text, flex: 1 },
  availChip: { backgroundColor: COLORS.success + "18", borderRadius: 99, paddingVertical: 2, paddingHorizontal: 8 },
  availChipGray: { backgroundColor: COLORS.border },
  availChipText: { fontSize: SIZES.xs, color: COLORS.success, fontWeight: "600" },
  cardDesig: { fontSize: SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },
  cardDomain: { fontSize: SIZES.xs, color: COLORS.primary, fontWeight: "600", marginTop: 2 },
  cardMeta: { flexDirection: "row", gap: 10, marginTop: 6 },
  metaText: { fontSize: SIZES.xs, color: COLORS.textSecondary },
  skillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 6 },
  skillChip: { backgroundColor: COLORS.primary + "12", borderRadius: 6, paddingVertical: 2, paddingHorizontal: 6 },
  skillChipText: { fontSize: SIZES.xs, color: COLORS.primary, fontWeight: "600" },
  emptyState: { alignItems: "center", paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: SIZES.lg, fontWeight: "700", color: COLORS.text },
  emptySub: { fontSize: SIZES.md, color: COLORS.textSecondary, marginTop: 4 },
});