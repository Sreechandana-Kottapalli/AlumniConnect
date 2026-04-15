import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, Modal, TextInput, ActivityIndicator,
} from "react-native";
import { COLORS, SIZES, SHADOWS } from "../constants/theme";

export default function AlumniDetailScreen({ route, navigation }) {
  const { alumni } = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [requested, setRequested] = useState(false);

  const handleSendRequest = async () => {
    if (!message.trim()) {
      Alert.alert("Empty Message", "Please write a message to the mentor.");
      return;
    }
    setSending(true);
    setTimeout(() => {
      setRequested(true);
      setModalVisible(false);
      setSending(false);
      Alert.alert("Request Sent! 🎉", `Your mentorship request has been sent to ${alumni.name}!`);
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.profileSection}>
            <View style={[styles.avatar, { backgroundColor: alumni.avatarColor }]}>
              <Text style={styles.avatarText}>{alumni.avatar}</Text>
            </View>
            {alumni.available && (
              <View style={styles.availableTag}>
                <Text style={styles.availableTagText}>● Available for Mentoring</Text>
              </View>
            )}
            <Text style={styles.name}>{alumni.name}</Text>
            <Text style={styles.designation}>{alumni.designation}</Text>
            <View style={styles.companyBadge}>
              <Text style={styles.companyBadgeText}>🏢 {alumni.company}</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          {[
            { label: "Batch", value: alumni.batch },
            { label: "Experience", value: alumni.experience },
            { label: "Connections", value: `${alumni.connections}+` },
            { label: "Location", value: alumni.location },
          ].map((s, i) => (
            <View key={i} style={styles.statItem}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.body}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bioText}>{alumni.bio}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Domain</Text>
            <View style={styles.domainBadge}>
              <Text style={styles.domainBadgeText}>{alumni.domain}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsGrid}>
              {alumni.skills.map(skill => (
                <View key={skill} style={styles.skillChip}>
                  <Text style={styles.skillChipText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Can Help You With</Text>
            {[
              "Career guidance in " + alumni.domain,
              "Resume & interview preparation",
              "Technical skill building",
              "Industry insights at " + alumni.company,
            ].map((item, i) => (
              <View key={i} style={styles.helpItem}>
                <Text style={styles.helpIcon}>✓</Text>
                <Text style={styles.helpText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={styles.ctaContainer}>
        {requested ? (
          <View style={styles.requestedBtn}>
            <Text style={styles.requestedBtnText}>✓ Request Sent!</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.connectBtn, !alumni.available && styles.connectBtnDisabled]}
            onPress={() => alumni.available ? setModalVisible(true) : null}>
            <Text style={styles.connectBtnText}>
              {alumni.available ? "✉️  Request Mentorship" : "Not Available Right Now"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Send Mentorship Request</Text>
            <Text style={styles.modalSub}>to {alumni.name} · {alumni.company}</Text>
            <TextInput
              style={styles.messageInput}
              placeholder={`Hi ${alumni.name.split(" ")[0]}! I'm a trainee at NCPL and would love your guidance...`}
              placeholderTextColor={COLORS.textLight}
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => { setModalVisible(false); setMessage(""); }}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sendBtn} onPress={handleSendRequest} disabled={sending}>
                {sending
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.sendBtnText}>Send Request</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.primary, paddingTop: 50, paddingBottom: 30, alignItems: "center" },
  backBtn: { alignSelf: "flex-start", marginLeft: 16, marginBottom: 16, backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 99 },
  backBtnText: { color: COLORS.white, fontSize: SIZES.sm, fontWeight: "600" },
  profileSection: { alignItems: "center" },
  avatar: { width: 84, height: 84, borderRadius: 42, alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: "rgba(255,255,255,0.5)", marginBottom: 10 },
  avatarText: { color: "#fff", fontSize: 28, fontWeight: "700" },
  availableTag: { backgroundColor: "#10B98125", borderRadius: 99, paddingVertical: 4, paddingHorizontal: 12, marginBottom: 8 },
  availableTagText: { color: COLORS.success, fontSize: SIZES.xs, fontWeight: "600" },
  name: { fontSize: SIZES.xxl, fontWeight: "800", color: COLORS.white },
  designation: { fontSize: SIZES.md, color: "rgba(255,255,255,0.75)", marginTop: 4 },
  companyBadge: { backgroundColor: COLORS.secondary, borderRadius: 99, paddingVertical: 5, paddingHorizontal: 14, marginTop: 8 },
  companyBadgeText: { color: COLORS.primary, fontSize: SIZES.sm, fontWeight: "700" },
  statsRow: { flexDirection: "row", backgroundColor: COLORS.white, marginHorizontal: 16, marginTop: -16, borderRadius: 16, padding: 16, ...SHADOWS.medium },
  statItem: { flex: 1, alignItems: "center" },
  statValue: { fontSize: SIZES.base, fontWeight: "800", color: COLORS.primary },
  statLabel: { fontSize: SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
  body: { padding: 16, marginTop: 8 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: SIZES.base, fontWeight: "700", color: COLORS.text, marginBottom: 10 },
  bioText: { fontSize: SIZES.md, color: COLORS.textSecondary, lineHeight: 22 },
  domainBadge: { backgroundColor: COLORS.primary, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 16, alignSelf: "flex-start" },
  domainBadgeText: { color: COLORS.white, fontSize: SIZES.sm, fontWeight: "700" },
  skillsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  skillChip: { backgroundColor: COLORS.white, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12, borderWidth: 1.5, borderColor: COLORS.primary + "30", ...SHADOWS.small },
  skillChipText: { fontSize: SIZES.sm, color: COLORS.primary, fontWeight: "600" },
  helpItem: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 8 },
  helpIcon: { fontSize: SIZES.md, color: COLORS.success, fontWeight: "700" },
  helpText: { fontSize: SIZES.md, color: COLORS.textSecondary, flex: 1 },
  ctaContainer: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: COLORS.white, padding: 16, paddingBottom: 32, borderTopWidth: 1, borderTopColor: COLORS.border },
  connectBtn: { backgroundColor: COLORS.primary, borderRadius: 14, padding: 18, alignItems: "center" },
  connectBtnDisabled: { backgroundColor: COLORS.textLight },
  connectBtnText: { color: COLORS.white, fontSize: SIZES.base, fontWeight: "700" },
  requestedBtn: { backgroundColor: COLORS.success, borderRadius: 14, padding: 18, alignItems: "center" },
  requestedBtnText: { color: COLORS.white, fontSize: SIZES.base, fontWeight: "700" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: SIZES.xl, fontWeight: "700", color: COLORS.text },
  modalSub: { fontSize: SIZES.sm, color: COLORS.textSecondary, marginTop: 2, marginBottom: 20 },
  messageInput: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, padding: 14, fontSize: SIZES.md, color: COLORS.text, backgroundColor: COLORS.background, height: 120 },
  modalBtns: { flexDirection: "row", gap: 10, marginTop: 16 },
  cancelBtn: { flex: 1, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, padding: 16, alignItems: "center" },
  cancelBtnText: { fontSize: SIZES.base, color: COLORS.textSecondary, fontWeight: "600" },
  sendBtn: { flex: 2, backgroundColor: COLORS.primary, borderRadius: 12, padding: 16, alignItems: "center" },
  sendBtnText: { color: COLORS.white, fontSize: SIZES.base, fontWeight: "700" },
});