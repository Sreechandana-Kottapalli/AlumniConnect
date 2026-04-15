import React, { useState, useRef } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator,
  Keyboard, ScrollView,
} from "react-native";
import { COLORS, SIZES, SHADOWS } from "../constants/theme";

const QUICK_PROMPTS = [
  { label: "🎯 Interview Tips", text: "Give me top 5 tips to crack an IT company interview as a fresher" },
  { label: "💼 Resume Help", text: "What should I include in my fresher resume for a software job?" },
  { label: "🧑‍💻 Best Skills", text: "What are the most in-demand IT skills in India right now?" },
  { label: "🏢 TCS Prep", text: "How do I prepare for TCS NQT exam and interview?" },
  { label: "📈 Salary Guide", text: "What is the average fresher salary in Indian IT companies?" },
  { label: "🌐 Web Dev Path", text: "What is the learning roadmap for becoming a web developer?" },
];

const WELCOME_MESSAGE = {
  id: "welcome",
  sender: "bot",
  text: "Hi! 👋 I'm your NCPL Career AI Assistant.\n\nI can help you with:\n• Interview preparation\n• Resume tips\n• Skill recommendations\n• Career guidance\n• IT job market insights\n\nWhat would you like to know today?",
  timestamp: new Date(),
};

const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE";

export default function ChatbotScreen() {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef(null);

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  };

  const sendMessage = async (text) => {
    const messageText = text || inputText.trim();
    if (!messageText) return;
    Keyboard.dismiss();
    setInputText("");

    const userMsg = {
      id: Date.now().toString(),
      sender: "user",
      text: messageText,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are an NCPL Career AI Assistant helping Indian IT freshers. Give practical, concise advice under 150 words.\n\nUser question: ${messageText}`
              }]
            }]
          }),
        }
      );
      const data = await response.json();
      const botText = data?.candidates?.[0]?.content?.parts?.[0]?.text
        || "Sorry, I couldn't process that. Please try again.";

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: botText,
        timestamp: new Date(),
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: "⚠️ Please add your Gemini API key in ChatbotScreen.js to enable AI responses!",
        timestamp: new Date(),
      }]);
    } finally {
      setIsTyping(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const renderMessage = ({ item }) => {
    const isUser = item.sender === "user";
    return (
      <View style={[styles.messageRow, isUser && styles.messageRowUser]}>
        {!isUser && (
          <View style={styles.botAvatar}>
            <Text style={styles.botAvatarText}>🤖</Text>
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
          <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>
            {item.text}
          </Text>
          <Text style={[styles.timestamp, isUser && styles.timestampUser]}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerAvatar}>
            <Text style={{ fontSize: 22 }}>🤖</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Career AI Assistant</Text>
            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Powered by Google Gemini</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.clearBtn}
          onPress={() => setMessages([WELCOME_MESSAGE])}>
          <Text style={styles.clearBtnText}>🗑 Clear</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListFooterComponent={
          isTyping ? (
            <View style={styles.typingRow}>
              <View style={styles.botAvatar}>
                <Text style={styles.botAvatarText}>🤖</Text>
              </View>
              <View style={styles.typingBubble}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.typingText}>Gemini is thinking...</Text>
              </View>
            </View>
          ) : null
        }
      />

      {messages.length <= 2 && (
        <View style={styles.quickPromptsSection}>
          <Text style={styles.quickPromptsTitle}>Quick Questions</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}>
            {QUICK_PROMPTS.map(item => (
              <TouchableOpacity
                key={item.label}
                style={styles.quickChip}
                onPress={() => sendMessage(item.text)}>
                <Text style={styles.quickChipText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Ask about careers, interviews, skills..."
          placeholderTextColor={COLORS.textLight}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!inputText.trim() || isTyping) && styles.sendBtnDisabled]}
          onPress={() => sendMessage()}
          disabled={!inputText.trim() || isTyping}>
          <Text style={styles.sendBtnText}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.primary, paddingTop: 55, paddingBottom: 16, paddingHorizontal: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: SIZES.base, fontWeight: "700", color: COLORS.white },
  onlineRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.success },
  onlineText: { fontSize: SIZES.xs, color: "rgba(255,255,255,0.75)" },
  clearBtn: { backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 99, paddingVertical: 6, paddingHorizontal: 12 },
  clearBtnText: { fontSize: SIZES.xs, color: COLORS.white, fontWeight: "600" },
  messagesList: { padding: 16, paddingBottom: 8 },
  messageRow: { flexDirection: "row", alignItems: "flex-end", marginBottom: 14, gap: 8 },
  messageRowUser: { flexDirection: "row-reverse" },
  botAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.primary + "18", alignItems: "center", justifyContent: "center" },
  botAvatarText: { fontSize: 16 },
  bubble: { maxWidth: "78%", borderRadius: 18, padding: 12, paddingBottom: 8 },
  bubbleBot: { backgroundColor: COLORS.white, borderBottomLeftRadius: 4, ...SHADOWS.small },
  bubbleUser: { backgroundColor: COLORS.primary, borderBottomRightRadius: 4 },
  bubbleText: { fontSize: SIZES.md, color: COLORS.text, lineHeight: 22 },
  bubbleTextUser: { color: COLORS.white },
  timestamp: { fontSize: 10, color: COLORS.textLight, marginTop: 4, textAlign: "right" },
  timestampUser: { color: "rgba(255,255,255,0.6)" },
  typingRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
  typingBubble: { backgroundColor: COLORS.white, borderRadius: 18, paddingVertical: 10, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", gap: 8, ...SHADOWS.small },
  typingText: { fontSize: SIZES.sm, color: COLORS.textSecondary },
  quickPromptsSection: { paddingVertical: 10, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: COLORS.white },
  quickPromptsTitle: { fontSize: SIZES.xs, fontWeight: "600", color: COLORS.textSecondary, paddingHorizontal: 16, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },
  quickChip: { backgroundColor: COLORS.primary + "12", borderRadius: 99, paddingVertical: 8, paddingHorizontal: 14, borderWidth: 1, borderColor: COLORS.primary + "25" },
  quickChipText: { fontSize: SIZES.sm, color: COLORS.primary, fontWeight: "600" },
  inputBar: { flexDirection: "row", alignItems: "flex-end", padding: 12, paddingBottom: 28, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border, gap: 10 },
  input: { flex: 1, backgroundColor: COLORS.background, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 12, fontSize: SIZES.md, color: COLORS.text, borderWidth: 1.5, borderColor: COLORS.border, maxHeight: 100 },
  sendBtn: { width: 46, height: 46, borderRadius: 23, backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center" },
  sendBtnDisabled: { backgroundColor: COLORS.textLight },
  sendBtnText: { color: COLORS.white, fontSize: 18, fontWeight: "700" },
});