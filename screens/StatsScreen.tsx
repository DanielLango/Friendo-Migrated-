import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Friend, Meeting } from '../types';
import { getFriends, getMeetings } from '../utils/storage';
import { isPremiumUser } from '../utils/premiumFeatures';
import { Paths, File } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Clipboard } from 'react-native';
import { useTheme } from '../utils/themeContext';

interface FriendStats {
  friend: Friend;
  meetingCount: number;
  lastMeeting?: string;
}

interface MonthlyData {
  month: string;
  monthName: string;
  meetingCount: number;
}

const { width } = Dimensions.get('window');

export default function StatsScreen() {
  const [friendStats, setFriendStats] = useState<FriendStats[]>([]);
  const [totalMeetings, setTotalMeetings] = useState(0);
  const [mostActiveMonth, setMostActiveMonth] = useState<MonthlyData | null>(null);
  const [monthlyBreakdown, setMonthlyBreakdown] = useState<MonthlyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [isPremium, setIsPremium] = useState(false);
  const { colors } = useTheme();
  
  const navigation = useNavigation();
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    loadStats();
    checkPremiumStatus();
  }, []);

  const checkPremiumStatus = async () => {
    const premium = await isPremiumUser();
    setIsPremium(premium);
  };

  const handleDownloadPreviousYears = async () => {
    try {
      const meetings = await getMeetings();
      const friends = await getFriends();
      
      const meetingsByYear: { [year: number]: Meeting[] } = {};
      meetings.forEach(meeting => {
        const year = new Date(meeting.date).getFullYear();
        if (!meetingsByYear[year]) {
          meetingsByYear[year] = [];
        }
        meetingsByYear[year].push(meeting);
      });

      let summary = '=== YOUR COMPLETE FRIENDSHIP HISTORY ===\n\n';
      
      const years = Object.keys(meetingsByYear).map(y => parseInt(y)).sort((a, b) => b - a);
      
      years.forEach(year => {
        const yearMeetings = meetingsByYear[year];
        const nonCancelledMeetings = yearMeetings.filter(m => !m.notes?.startsWith('[CANCELLED]'));
        const cancelledMeetings = yearMeetings.filter(m => m.notes?.startsWith('[CANCELLED]'));
        
        summary += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        summary += `YEAR ${year}\n`;
        summary += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        summary += `Total Meetings: ${nonCancelledMeetings.length}\n`;
        summary += `Cancelled Meetings: ${cancelledMeetings.length}\n\n`;
        
        const friendStatsForYear: { [friendId: string]: { name: string; count: number; cancelled: number } } = {};
        
        nonCancelledMeetings.forEach(meeting => {
          const friend = friends.find(f => f.id === meeting.friendId);
          if (friend) {
            if (!friendStatsForYear[friend.id]) {
              friendStatsForYear[friend.id] = { name: friend.name, count: 0, cancelled: 0 };
            }
            friendStatsForYear[friend.id].count++;
          }
        });
        
        cancelledMeetings.forEach(meeting => {
          const friend = friends.find(f => f.id === meeting.friendId);
          if (friend) {
            if (!friendStatsForYear[friend.id]) {
              friendStatsForYear[friend.id] = { name: friend.name, count: 0, cancelled: 0 };
            }
            friendStatsForYear[friend.id].cancelled++;
          }
        });
        
        const sortedFriends = Object.values(friendStatsForYear).sort((a, b) => b.count - a.count);
        
        if (sortedFriends.length > 0) {
          summary += `ALL FRIENDS (${sortedFriends.length}):\n`;
          sortedFriends.forEach((friend, index) => {
            const cancelInfo = friend.cancelled > 0 ? ` (${friend.cancelled} cancelled)` : '';
            summary += `  ${index + 1}. ${friend.name} - ${friend.count} meeting${friend.count !== 1 ? 's' : ''}${cancelInfo}\n`;
          });
          summary += `\n`;
        }
        
        if (yearMeetings.length > 0) {
          summary += `ALL MEETINGS (${yearMeetings.length}):\n`;
          yearMeetings
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .forEach(meeting => {
              const friend = friends.find(f => f.id === meeting.friendId);
              const friendName = friend ? friend.name : 'Unknown';
              const date = new Date(meeting.date).toLocaleDateString();
              const cancelled = meeting.notes?.startsWith('[CANCELLED]') ? ' [CANCELLED]' : '';
              summary += `  • ${date} - ${friendName}${cancelled}\n`;
            });
          summary += `\n`;
        }
      });
      
      summary += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      summary += `Generated: ${new Date().toLocaleDateString()}\n`;
      summary += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

      console.log('\n' + summary + '\n');
      
      Alert.alert(
        'Export Your Friendship History',
        'Your complete friendship history is ready! Tap "Copy to Clipboard" below, then paste it wherever you\'d like - such as your phone\'s Notes app, a document, or share it with friends.',
        [
          {
            text: 'Copy to Clipboard',
            onPress: () => {
              Clipboard.setString(summary);
              Alert.alert(
                'Copied! ✓',
                'Your friendship history has been copied to your clipboard. You can now paste it into your Notes app or anywhere else you\'d like to save it.',
                [{ text: 'Got it!' }]
              );
            }
          },
          { 
            text: 'View Summary',
            onPress: () => {
              const preview = summary.length > 500 ? summary.substring(0, 500) + '...\n\n[Full history copied to console]' : summary;
              Alert.alert('Preview', preview, [
                {
                  text: 'Copy Full History',
                  onPress: () => {
                    Clipboard.setString(summary);
                    Alert.alert('Copied!', 'Full history copied to clipboard.');
                  }
                },
                { text: 'Close' }
              ]);
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('Error downloading previous years data:', error);
      Alert.alert('Error', 'Failed to generate history. Please try again.');
    }
  };

  useEffect(() => {
    if (!isLoading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isLoading]);

  const loadStats = async () => {
    try {
      const friends = await getFriends();
      const meetings = await getMeetings();
      
      const yearMeetings = meetings.filter((meeting) => {
        const isCurrentYear = new Date(meeting.date).getFullYear() === currentYear;
        const isCancelled = meeting.notes?.startsWith('[CANCELLED]');
        return isCurrentYear && !isCancelled;
      });

      setTotalMeetings(yearMeetings.length);

      const stats = friends.map((friend) => {
        const friendMeetings = yearMeetings.filter((meeting) => meeting.friendId === friend.id);
        const lastMeeting = friendMeetings.length > 0 
          ? friendMeetings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
          : null;
        
        return {
          friend: friend,
          meetingCount: friendMeetings.length,
          lastMeeting: lastMeeting?.date,
        };
      });

      stats.sort((a, b) => b.meetingCount - a.meetingCount);
      setFriendStats(stats);

      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];

      const monthlyData = months.map((monthName, index) => {
        const monthMeetings = yearMeetings.filter((meeting) => {
          const meetingDate = new Date(meeting.date);
          return meetingDate.getMonth() === index;
        });

        return {
          month: String(index + 1).padStart(2, '0'),
          monthName,
          meetingCount: monthMeetings.length,
        };
      });

      setMonthlyBreakdown(monthlyData);

      const mostActive = monthlyData.reduce((prev, current) => 
        prev.meetingCount > current.meetingCount ? prev : current
      );
      
      if (mostActive.meetingCount > 0) {
        setMostActiveMonth(mostActive);
      }

    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankEmoji = (position: number) => {
    switch (position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `${position}`;
    }
  };

  const averageMeetingsPerFriend = friendStats.length > 0 
    ? Math.round((totalMeetings / friendStats.length) * 10) / 10 
    : 0;

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContent}>
          <Text style={styles.loadingEmoji}>✨</Text>
          <Text style={[styles.loadingText, { color: colors.text }]}>Analyzing your friendships...</Text>
          <Text style={[styles.loadingSubtext, { color: colors.textSecondary }]}>Creating your {currentYear} In a Nutshell</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.header}>
            <TouchableOpacity 
              style={[styles.backButton, {
                backgroundColor: colors.isDarkMode ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)'
              }]}
              onPress={() => navigation.goBack()}
            >
              <Text style={[styles.backButtonText, { color: colors.purple }]}>← Back</Text>
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <Text style={styles.sparkles}>✨</Text>
              <Text style={[styles.title, { color: colors.text }]}>Your {currentYear}</Text>
              <Text style={[styles.subtitle, { color: colors.purple }]}>Friendship In a Nutshell</Text>
              <Text style={styles.sparkles}>✨</Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: colors.purple }]}>
              <Text style={styles.statEmoji}>💜</Text>
              <Text style={styles.statNumber}>{friendStats.length}</Text>
              <Text style={styles.statLabel}>Total Friends</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.green }]}>
              <Text style={styles.statEmoji}>📅</Text>
              <Text style={styles.statNumber}>{totalMeetings}</Text>
              <Text style={styles.statLabel}>Meetings in {currentYear}</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.pink }]}>
              <Text style={styles.statEmoji}>📊</Text>
              <Text style={styles.statNumber}>{averageMeetingsPerFriend}</Text>
              <Text style={styles.statLabel}>Avg. per Friend</Text>
            </View>
          </View>

          {mostActiveMonth && (
            <View style={[styles.highlightCard, {
              backgroundColor: colors.isDarkMode ? 'rgba(255, 165, 0, 0.2)' : 'rgba(255, 165, 0, 0.1)',
              borderColor: colors.isDarkMode ? 'rgba(255, 165, 0, 0.4)' : 'rgba(255, 165, 0, 0.3)'
            }]}>
              <Text style={styles.highlightEmoji}>🔥</Text>
              <Text style={[styles.highlightTitle, { color: colors.text }]}>
                Your most social month was {mostActiveMonth.monthName}
              </Text>
              <Text style={[styles.highlightSubtitle, { color: colors.textSecondary }]}>
                You had {mostActiveMonth.meetingCount} meeting{mostActiveMonth.meetingCount !== 1 ? 's' : ''} - that's the spirit!
              </Text>
            </View>
          )}

          <View style={[styles.leaderboardCard, {
            backgroundColor: colors.isDarkMode ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)'
          }]}>
            <View style={styles.leaderboardHeader}>
              <Text style={styles.trophyEmoji}>🏆</Text>
              <Text style={[styles.leaderboardTitle, { color: colors.text }]}>
                Top Friends by Meetings in {currentYear}
              </Text>
            </View>
            
            {friendStats.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>No meetings logged yet this year</Text>
                <Text style={[styles.emptyStateSubtext, { color: colors.textTertiary }]}>Start logging meetings to see your top friends!</Text>
              </View>
            ) : (
              <View style={styles.friendsList}>
                {friendStats.slice(0, 5).map((friend, index) => {
                  const position = index + 1;
                  const isTop3 = position <= 3;
                  
                  return (
                    <View
                      key={friend.friend.id}
                      style={[
                        styles.friendItem,
                        isTop3 ? [styles.friendItemTop3, {
                          backgroundColor: colors.isDarkMode ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255, 215, 0, 0.1)',
                          borderColor: colors.isDarkMode ? 'rgba(255, 215, 0, 0.4)' : 'rgba(255, 215, 0, 0.3)'
                        }] : [styles.friendItemRegular, {
                          backgroundColor: colors.isDarkMode ? '#2A2A2A' : '#F5F5F5',
                          borderColor: colors.border
                        }]
                      ]}
                    >
                      <View style={styles.friendLeft}>
                        <View style={[
                          styles.rankBadge,
                          position === 1 ? styles.goldBadge :
                          position === 2 ? styles.silverBadge :
                          position === 3 ? styles.bronzeBadge :
                          styles.regularBadge
                        ]}>
                          <Text style={styles.rankText}>{getRankEmoji(position)}</Text>
                        </View>
                        <View style={styles.friendInfo}>
                          <Text style={[styles.friendName, { color: colors.text }]}>{friend.friend.name}</Text>
                          <View style={styles.friendMeta}>
                            <View style={[styles.friendTypeBadge, {
                              backgroundColor: colors.isDarkMode ? 'rgba(168, 85, 247, 0.2)' : 'rgba(128, 0, 255, 0.1)',
                              borderColor: colors.isDarkMode ? 'rgba(168, 85, 247, 0.4)' : 'rgba(128, 0, 255, 0.3)'
                            }]}>
                              <Text style={[styles.friendTypeText, { color: colors.purple }]}>{friend.friend.friendType}</Text>
                            </View>
                            {friend.lastMeeting && (
                              <Text style={[styles.lastMeetingText, { color: colors.textSecondary }]}>
                                Last met: {new Date(friend.lastMeeting).toLocaleDateString()}
                              </Text>
                            )}
                          </View>
                        </View>
                      </View>
                      <View style={styles.friendRight}>
                        <Text style={[styles.meetingCount, { color: colors.text }]}>{friend.meetingCount}</Text>
                        <Text style={[styles.meetingLabel, { color: colors.textSecondary }]}>
                          meeting{friend.meetingCount !== 1 ? 's' : ''}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.downloadButton,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.purple
              },
              !isPremium && {
                backgroundColor: colors.isDarkMode ? '#2A2A2A' : '#F5F5F5',
                borderColor: colors.textDisabled,
                opacity: 0.6
              }
            ]}
            onPress={isPremium ? handleDownloadPreviousYears : undefined}
            disabled={!isPremium}
          >
            <Text style={[
              styles.downloadButtonIcon,
              !isPremium && styles.downloadButtonIconDisabled
            ]}>
              📥
            </Text>
            <View style={styles.downloadButtonTextContainer}>
              <Text style={[
                styles.downloadButtonText,
                { color: colors.purple },
                !isPremium && { color: colors.textTertiary }
              ]}>
                Download previous years data
              </Text>
              {!isPremium && (
                <Text style={[styles.downloadButtonSubtext, { color: colors.textTertiary }]}>
                  Premium feature only
                </Text>
              )}
            </View>
          </TouchableOpacity>

          <View style={[styles.chartCard, {
            backgroundColor: colors.isDarkMode ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)'
          }]}>
            <Text style={[styles.chartTitle, { color: colors.text }]}>Your {currentYear} Friendship Journey</Text>
            <View style={styles.chartContainer}>
              {monthlyBreakdown.map((month) => {
                const maxMeetings = Math.max(...monthlyBreakdown.map(m => m.meetingCount));
                const height = maxMeetings > 0 ? (month.meetingCount / maxMeetings) * 80 : 4;
                
                return (
                  <View key={month.month} style={styles.chartBar}>
                    <View style={styles.barContainer}>
                      <View
                        style={[
                          styles.bar,
                          { height: Math.max(height, 4), backgroundColor: colors.purple }
                        ]}
                      >
                        {month.meetingCount > 0 && (
                          <Text style={styles.barValue}>{month.meetingCount}</Text>
                        )}
                      </View>
                    </View>
                    <Text style={[styles.monthLabel, { color: colors.textSecondary }]}>
                      {month.monthName.slice(0, 3)}
                    </Text>
                  </View>
                );
              })}
            </View>
            <Text style={[styles.chartFooter, { color: colors.textSecondary }]}>
              Total meetings across all months: {totalMeetings}
            </Text>
          </View>

          <View style={[styles.memoCard, {
            backgroundColor: colors.isDarkMode ? 'rgba(168, 85, 247, 0.2)' : 'rgba(128, 0, 255, 0.1)',
            borderColor: colors.isDarkMode ? 'rgba(168, 85, 247, 0.4)' : 'rgba(128, 0, 255, 0.3)'
          }]}>
            <Text style={styles.memoEmoji}>📝</Text>
            <Text style={[styles.memoTitle, { color: colors.text }]}>Friendship Memo</Text>
            <Text style={[styles.memoSubtitle, { color: colors.textSecondary }]}>
              Feature coming soon! Create yearly notes and memories with your friends.
            </Text>
            <View style={[styles.comingSoonBadge, {
              backgroundColor: colors.isDarkMode ? 'rgba(168, 85, 247, 0.3)' : 'rgba(255, 255, 255, 0.5)',
              borderColor: colors.isDarkMode ? 'rgba(168, 85, 247, 0.5)' : 'rgba(128, 0, 255, 0.3)'
            }]}>
              <Text style={[styles.comingSoonText, { color: colors.purple }]}>Coming Soon</Text>
            </View>
          </View>

          <View style={[styles.allTimeCard, {
            backgroundColor: colors.isDarkMode ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)'
          }]}>
            <Text style={[styles.allTimeTitle, { color: colors.text }]}>All-Time Friendship Stats</Text>
            <View style={styles.allTimeStats}>
              <View style={styles.allTimeStat}>
                <Text style={[styles.allTimeNumber, { color: colors.text }]}>{totalMeetings}</Text>
                <Text style={[styles.allTimeLabel, { color: colors.textSecondary }]}>Total Meetings Ever</Text>
              </View>
              <View style={styles.allTimeStat}>
                <Text style={[styles.allTimeNumber, { color: colors.text }]}>{averageMeetingsPerFriend}</Text>
                <Text style={[styles.allTimeLabel, { color: colors.textSecondary }]}>Avg. All-Time per Friend</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingEmoji: {
    fontSize: 48,
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 18,
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  titleContainer: {
    alignItems: 'center',
  },
  sparkles: {
    fontSize: 24,
    marginBottom: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 5,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: 32,
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  highlightCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 1,
  },
  highlightEmoji: {
    fontSize: 32,
    marginBottom: 10,
  },
  highlightTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  highlightSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  leaderboardCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
  },
  leaderboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  trophyEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  leaderboardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 12,
  },
  friendsList: {
    gap: 15,
  },
  friendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
  },
  friendItemTop3: {
    borderWidth: 2,
  },
  friendItemRegular: {
    borderWidth: 1,
  },
  friendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  goldBadge: {
    backgroundColor: '#FFD700',
  },
  silverBadge: {
    backgroundColor: '#C0C0C0',
  },
  bronzeBadge: {
    backgroundColor: '#CD7F32',
  },
  regularBadge: {
    backgroundColor: '#E0E0E0',
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  friendMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  friendTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
  },
  friendTypeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  lastMeetingText: {
    fontSize: 10,
  },
  friendRight: {
    alignItems: 'center',
  },
  meetingCount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  meetingLabel: {
    fontSize: 10,
  },
  chartCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 100,
    marginBottom: 10,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
  },
  barContainer: {
    height: 80,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 8,
  },
  bar: {
    width: 20,
    borderRadius: 10,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 4,
  },
  barValue: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
  monthLabel: {
    fontSize: 10,
    textAlign: 'center',
  },
  chartFooter: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
  },
  memoCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 1,
  },
  memoEmoji: {
    fontSize: 32,
    marginBottom: 10,
  },
  memoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  memoSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
  },
  comingSoonBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
  },
  comingSoonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  allTimeCard: {
    borderRadius: 16,
    padding: 20,
  },
  allTimeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  allTimeStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  allTimeStat: {
    alignItems: 'center',
  },
  allTimeNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  allTimeLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  downloadButton: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
  },
  downloadButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  downloadButtonIconDisabled: {
    opacity: 0.5,
  },
  downloadButtonTextContainer: {
    alignItems: 'center',
  },
  downloadButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  downloadButtonSubtext: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 2,
  },
});