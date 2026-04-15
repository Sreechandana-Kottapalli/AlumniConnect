import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Switch, TextInput, Modal, Alert,
} from "react-native";
import { COLORS, SIZES, SHADOWS } from "../constants/theme";

export default function ProfileScreen() {
  const [notifications, setNotifications] = useState(true);
  const [editModal, setEditModal] = useState(false);

  const [profile, setProfile] = useState({
    name: "Deepika Nair",
    email: "deepika@example.com",
    role: "trainee",
    batch: "2024",
    domain: "Web Development",
    skills: ["HTML", "CSS", "JavaScript", "React"],
    bio: "Currently learning React at NCPL. Looking for mentorship in frontend development.",
    avatar: "DN",
    avatarColor: "#7C3AED",
    connections: 5,
    requestsSent: 2,
  });

  const [editName, setEditName] = useState(profile.name);
  const [editBio, setEditBio] = useState(profile.bio);
  const [editDomain, setEditDomain] = useState(profile.domain);
  const [editBatch, setEditBatch] = useState(profile.batch);

  const handleSave = () => {
    setProfile(prev => ({
      ...prev,
      name: editName,
      bio: editBio,
      domain: editDomain,
      batch: editBatch,
      avatar: editName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2),
    }));
    setEditModal(false);
    Alert.alert("Success! ✅", "Your profile has been updated.");
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: profile.avatarColor }]}>
          <Text style={styles.avatarText}>{profile.avatar}</Text>
        </View>
        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.email}>{profile.email}</Text>
        <View style={styles.rolePill}>
          <Text style={styles.rolePillText}>📚 Trainee · Batch {profile.batch}</Text>
        </View>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => {
            setEditName(profile.name);
            setEditBio(profile.bio);
            setEditDomain(profile.domain);
            setEditBatch(profile.batch);
            setEditModal(true);
          }}>
          <Text style={styles.editBtnText}>✏️  Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        {[
          { label: "Connections", value: profile.connections },
          { label: "Requests Sent", value: profile.requestsSent },
          { label: "Domain", value: "Web Dev" },
        ].map((s, i) => (
          <View key={i} style={[styles.statItem, i < 2 && styles.statBorder]}>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.body}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Me</Text>
          <Text style={styles.bioText}>{profile.bio}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Skills</Text>
          <View style={styles.skillsRow}>
            {profile.skills.map(skill => (
              <View key={skill} style={styles.skillChip}>
                <Text style={styles.skillChipText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Text style={styles.settingDesc}>Get notified for new messages</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>More</Text>
          {[
            { icon: "📋", label: "My Mentorship Requests" },
            { icon: "🔒", label: "Privacy & Security" },
            { icon: "❓", label: "Help & Support" },
            { icon: "ℹ️", label: "About NCPL" },
          ].map((item, i) => (
            <TouchableOpacity key={i} style={styles.menuItem}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.version}>NCPL Alumni Connect v1.0.0</Text>
      </View>
      <View style={{ height: 80 }} />

      <Modal visible={editModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <Text style={styles.label}>Full Name</Text>
            <TextInput style={styles.input} value={editName} onChangeText={setEditName} placeholder="Your full name" />
            <Text style={styles.label}>Batch Year</Text>
            <TextInput style={styles.input} value={editBatch} onChangeText={setEditBatch} placeholder="e.g. 2024" keyboardType="numeric" maxLength={4} />
            <Text style={styles.label}>Domain</Text>
            <TextInput style={styles.input} value={editDomain} onChangeText={setEditDomain} placeholder="e.g. Web Development" />
            <Text style={styles.label}>Bio</Text>
            <TextInput style={[styles.input, { height: 80 }]} value={editBio} onChangeText={setEditBio} placeholder="Write something about yourself..." multiline textAlignVertical="top" />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.primary, paddingTop: 55, paddingBottom: 30, alignItems: "center", paddingHorizontal: 20 },
  avatar: { width: 88, height: 88, borderRadius: 44, alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: "rgba(255,255,255,0.5)", marginBottom: 12 },
  avatarText: { color: "#fff", fontSize: 30, fontWeight: "700" },
  name: { fontSize: SIZES.xxl, fontWeight: "800", color: COLORS.white },
  email: { fontSize: SIZES.sm, color: "rgba(255,255,255,0.7)", marginTop: 4 },
  rolePill: { backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 99, paddingVertical: 5, paddingHorizontal: 14, marginTop: 8 },
  rolePillText: { color: COLORS.white, fontSize: SIZES.sm, fontWeight: "500" },
  editBtn: { marginTop: 14, borderWidth: 1.5, borderColor: "rgba(255,255,255,0.5)", borderRadius: 99, paddingVertical: 7, paddingHorizontal: 18 },
  editBtnText: { color: COLORS.white, fontSize: SIZES.sm, fontWeight: "600" },
  statsRow: { backgroundColor: COLORS.white, marginHorizontal: 16, marginTop: -16, borderRadius: 16, padding: 16, flexDirection: "row", ...SHADOWS.medium },
  statItem: { flex: 1, alignItems: "center" },
  statBorder: { borderRightWidth: 1, borderRightColor: COLORS.border },
  statValue: { fontSize: SIZES.xl, fontWeight: "800", color: COLORS.primary },
  statLabel: { fontSize: SIZES.xs, color: COLORS.textSecondary, marginTop: 2, textAlign: "center" },
  body: { padding: 16, marginTop: 8 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: SIZES.base, fontWeight: "700", color: COLORS.text, marginBottom: 12 },
  bioText: { fontSize: SIZES.md, color: COLORS.textSecondary, lineHeight: 22 },
  skillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  skillChip: { backgroundColor: COLORS.white, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12, borderWidth: 1.5, borderColor: COLORS.primary + "30", ...SHADOWS.small },
  skillChipText: { fontSize: SIZES.sm, color: COLORS.primary, fontWeight: "600" },
  settingRow: { backgroundColor: COLORS.white, borderRadius: 12, padding: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8, ...SHADOWS.small },
  settingLabel: { fontSize: SIZES.md, fontWeight: "600", color: COLORS.text },
  settingDesc: { fontSize: SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
  menuItem: { backgroundColor: COLORS.white, borderRadius: 12, padding: 14, flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 6, ...SHADOWS.small },
  menuIcon: { fontSize: 20 },
  menuLabel: { flex: 1, fontSize: SIZES.md, color: COLORS.text, fontWeight: "500" },
  menuArrow: { fontSize: 22, color: COLORS.textLight },
  version: { textAlign: "center", fontSize: SIZES.xs, color: COLORS.textLight, marginTop: 16 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: SIZES.xl, fontWeight: "700", color: COLORS.text, marginBottom: 20 },
  label: { fontSize: SIZES.sm, fontWeight: "600", color: COLORS.text, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 },
  input: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, padding: 14, fontSize: SIZES.md, color: COLORS.text, backgroundColor: COLORS.background, marginBottom: 14 },
  modalBtns: { flexDirection: "row", gap: 10, marginTop: 8 },
  cancelBtn: { flex: 1, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, padding: 16, alignItems: "center" },
  cancelBtnText: { fontSize: SIZES.base, color: COLORS.textSecondary, fontWeight: "600" },
  saveBtn: { flex: 2, backgroundColor: COLORS.primary, borderRadius: 12, padding: 16, alignItems: "center" },
  saveBtnText: { color: COLORS.white, fontSize: SIZES.base, fontWeight: "700" },
});