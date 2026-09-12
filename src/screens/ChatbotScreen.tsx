import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  SafeAreaView, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme, colors } from '../theme/colors';
import { chatbotAPI, mlAPI } from '../services/api';

interface Message { role: 'user' | 'assistant'; content: string; timestamp: Date; source?: string; }

export const ChatbotScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [suggestion, setSuggestion] = useState<any>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    fetchGreeting();
    fetchSuggestion();
  }, []);

  const fetchGreeting = async () => {
    try {
      const res = await chatbotAPI.getGreeting();
      setMessages([{
        role: 'assistant',
        content: res.data?.content || res.data?.message || 'Hi there! I am NeuroBot.',
        timestamp: new Date(),
        source: 'hardcoded'
      }]);
    } catch { /* silent */ }
  };

  const fetchSuggestion = async () => {
    try {
      const res = await chatbotAPI.getSuggestion();
      setSuggestion(res.data);
    } catch { /* silent */ }
  };

  const handleClearContext = async () => {
    try {
      await chatbotAPI.clearContext();
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Context cleared. What would you like to talk about next?',
        timestamp: new Date()
      }]);
    } catch { /* silent */ }
  };

  const handleSend = async (customMessage?: string) => {
    const textToSend = customMessage || message;
    if (!textToSend.trim() || loading) return;
    const userMessage = textToSend.trim();
    if (!customMessage) setMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: new Date() }]);
    setLoading(true);

    try {
      const res = await chatbotAPI.chat(userMessage);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.data?.content || res.data?.message || 'No response from server',
        timestamp: new Date(),
        source: res.data?.source || 'ai'
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Server error. Please try again.",
        timestamp: new Date(),
        source: 'cached'
      }]);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, loading]);

  const getSourceBadge = (source?: string) => {
    if (!source) return null;
    let text = 'AI'; let color = '#ffb74d';
    if (source === 'cached') { text = 'Cached'; color = '#64b5f6'; }
    if (source === 'hardcoded') { text = 'Quick Reply'; color = '#4caf50'; }
    if (source === 'pdf') { text = 'PDF Analysis'; color = '#ce93d8'; }

    return (
      <View style={[styles.sourceBadge, { backgroundColor: `${color}15`, borderColor: `${color}44` }]}>
        <Text style={[styles.sourceText, { color }]}>{text}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={styles.avatar}>
            <Ionicons name="hardware-chip" size={20} color="#fff" />
          </View>
          <Text style={styles.title}>NeuroBot</Text>
        </View>
        <TouchableOpacity onPress={handleClearContext}>
          <Ionicons name="trash-outline" size={20} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {suggestion && (
            <TouchableOpacity 
              style={styles.suggestionCard} 
              activeOpacity={0.8}
              onPress={() => handleSend(suggestion.suggestion)}
            >
              <View style={styles.sugHeader}>
                <Ionicons name="sparkles" size={16} color={colors.primary} />
                <Text style={styles.sugTitle}>Learning Suggestion</Text>
                <View style={[styles.sugPriority, suggestion.priority === 'high' && styles.sugPriorityHigh]}>
                  <Text style={[styles.sugPriorityText, suggestion.priority === 'high' && { color: '#f44336' }]}>
                    {suggestion.priority}
                  </Text>
                </View>
              </View>
              <Text style={styles.sugText}>{suggestion.suggestion}</Text>
              <Text style={styles.sugReason}>{suggestion.reason}</Text>
            </TouchableOpacity>
          )}

          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <View key={idx} style={[styles.msgRow, isUser ? styles.msgUser : styles.msgBot]}>
                {!isUser && (
                  <View style={styles.msgAvatar}>
                    <Ionicons name="hardware-chip" size={14} color="#fff" />
                  </View>
                )}
                <View style={{ maxWidth: '80%' }}>
                  <View style={[styles.msgBubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
                    <Text style={[styles.msgText, isUser && styles.msgTextUser]}>{msg.content}</Text>
                  </View>
                  {!isUser && getSourceBadge(msg.source)}
                </View>
              </View>
            );
          })}
          {loading && (
            <View style={[styles.msgRow, styles.msgBot]}>
              <View style={styles.msgAvatar}>
                <Ionicons name="hardware-chip" size={14} color="#fff" />
              </View>
              <View style={[styles.msgBubble, styles.bubbleBot, { paddingVertical: 12, paddingHorizontal: 16 }]}>
                <ActivityIndicator color={colors.primary} size="small" />
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputArea}>
          <TouchableOpacity style={styles.pdfBtn}>
            <Ionicons name="document-text" size={22} color={colors.primary} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Ask NeuroBot or upload a PDF..."
            placeholderTextColor={theme.textSecondary}
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={4}
          />
          <TouchableOpacity style={[styles.sendBtn, !message.trim() && { opacity: 0.5 }]} onPress={() => handleSend()} disabled={!message.trim() || loading}>
            <Ionicons name="send" size={18} color="#000" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.border },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '700', color: theme.text },
  scrollContent: { padding: 16, paddingBottom: 24 },
  suggestionCard: { backgroundColor: theme.surface, borderRadius: 12, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: theme.border },
  sugHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  sugTitle: { fontSize: 14, fontWeight: '700', color: theme.text, flex: 1 },
  sugPriority: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, backgroundColor: '#333' },
  sugPriorityHigh: { backgroundColor: '#f4433622' },
  sugPriorityText: { fontSize: 10, color: theme.textSecondary, textTransform: 'capitalize', fontWeight: '600' },
  sugText: { fontSize: 14, color: theme.text, fontWeight: '500', marginBottom: 4 },
  sugReason: { fontSize: 12, color: theme.textSecondary },
  msgRow: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-end' },
  msgUser: { justifyContent: 'flex-end' },
  msgBot: { justifyContent: 'flex-start' },
  msgAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  msgBubble: { padding: 12, borderRadius: 16, maxWidth: '100%' },
  bubbleUser: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bubbleBot: { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, borderBottomLeftRadius: 4 },
  msgText: { fontSize: 15, color: theme.text, lineHeight: 22 },
  msgTextUser: { color: '#000', fontWeight: '500' },
  sourceBadge: { alignSelf: 'flex-start', marginTop: 4, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1 },
  sourceText: { fontSize: 10, fontWeight: '600' },
  inputArea: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, borderTopWidth: 1, borderTopColor: theme.border, backgroundColor: '#000' },
  pdfBtn: { padding: 10 },
  input: { flex: 1, minHeight: 44, maxHeight: 120, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, borderRadius: 22, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, color: theme.text, fontSize: 15, marginHorizontal: 8 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
});
