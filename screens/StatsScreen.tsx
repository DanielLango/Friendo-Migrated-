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
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

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
      
      // Group meetings by year
      const meetingsByYear: { [year: number]: Meeting[] } = {};
      meetings.forEach(meeting => {
        const year = new Date(meeting.date).getFullYear();
        if (!meetingsByYear[year]) {
          meetingsByYear[year] = [];
        }
        meetingsByYear[year].push(meeting);
      });

      // Create simple TXT content with year-by-year breakdown
      let txtContent = '=== FRIENDO - YOUR FRIENDSHIP HISTORY ===\n\n';
      
      // Sort years in descending order (newest first)
      const years = Object.keys(meetingsByYear).map(y => parseInt(y)).sort((a, b) => b - a);
      
      years.forEach(year => {
        const yearMeetings = meetingsByYear[year];
        const nonCancelledMeetings = yearMeetings.filter(m => !m.notes?.startsWith('[CANCELLED]'));
        
        txtContent += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        txtContent += `YEAR ${year}\n`;
        txtContent += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        txtContent += `Total Meetings: ${nonCancelledMeetings.length}\n`;
        txtContent += `Cancelled Meetings: ${yearMeetings.length - nonCancelledMeetings.length}\n\n`;
        
        // Calculate friend stats for this year
        const friendStatsForYear: { [friendId: string]: { name: string; count: number } } = {};
        nonCancelledMeetings.forEach(meeting => {
          const friend = friends.find(f => f.id === meeting.friendId);
          if (friend) {
            if (!friendStatsForYear[friend.id]) {
              friendStatsForYear[friend.id] = { name: friend.name, count: 0 };
            }
            friendStatsForYear[friend.id].count++;
          }
        });
        
        // Sort friends by meeting count
        const sortedFriends = Object.values(friendStatsForYear).sort((a, b) => b.count - a.count);
        
        if (sortedFriends.length > 0) {
          txtContent += `Top Friends:\n`;
          sortedFriends.forEach((friend, index) => {
            txtContent += `  ${index + 1}. ${friend.name} - ${friend.count} meeting${friend.count !== 1 ? 's' : ''}\n`;
          });
          txtContent += `\n`;
        }
        
        txtContent += `\n`;
      });
      
      txtContent += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      txtContent += `Generated on ${new Date().toLocaleDateString()}\n`;
      txtContent += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

      // Save to file using the new File API
      const fileName = `friendo_history_${Date.now()}.txt`;
      const fileUri = Paths.cache + '/' + fileName;
      
      // Create a File object and write the content
      const file = new File(fileUri);
      await file.create();
      await file.write(txtContent);

      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/plain',
          dialogTitle: 'Export Friendo History',
        });
        Alert.alert('Success', 'Your friendship history has been exported!');
      } else {
        Alert.alert('Success', `File saved to: ${fileUri}`);
      }
    } catch (error) {
      console.error('Error downloading previous years data:', error);
      Alert.alert('Error', 'Failed to export data. Please try again.');
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
      
      // Filter for current year AND exclude cancelled meetings
      const yearMeetings = meetings.filter((meeting) => {
        const isCurrentYear = new Date(meeting.date).getFullYear() === currentYear;
        const isCancelled = meeting.notes?.startsWith('[CANCELLED]');
        return isCurrentYear && !isCancelled;
      });

      setTotalMeetings(yearMeetings.length);

      // Calculate friend stats
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

      // Calculate monthly breakdown
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

      // Find most active month
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
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <Text style={styles.loadingEmoji}>✨</Text>
          <Text style={styles.loadingText}>Analyzing your friendships...</Text>
          <Text style={styles.loadingSubtext}>Creating your {currentYear} In a Nutshell</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
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
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <Text style={styles.sparkles}>✨</Text>
              <Text style={styles.title}>Your {currentYear}</Text>
              <Text style={styles.subtitle}>Friendship In a Nutshell</Text>
              <Text style={styles.sparkles}>✨</Text>
            </View>
          </View>

          {/* Main Stats Cards */}
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, styles.purpleGradient]}>
              <Text style={styles.statEmoji}>💜</Text>
              <Text style={styles.statNumber}>{friendStats.length}</Text>
              <Text style={styles.statLabel}>Total Friends</Text>
            </View>

            <View style={[styles.statCard, styles.greenGradient]}>
              <Text style={styles.statEmoji}>📅</Text>
              <Text style={styles.statNumber}>{totalMeetings}</Text>
              <Text style={styles.statLabel}>Meetings in {currentYear}</Text>
            </View>

            <View style={[styles.statCard, styles.pinkGradient]}>
              <Text style={styles.statEmoji}>📊</Text>
              <Text style={styles.statNumber}>{averageMeetingsPerFriend}</Text>
              <Text style={styles.statLabel}>Avg. per Friend</Text>
            </View>
          </View>

          {/* Most Active Month */}
          {mostActiveMonth && (
            <View style={styles.highlightCard}>
              <Text style={styles.highlightEmoji}>🔥</Text>
              <Text style={styles.highlightTitle}>
                Your most social month was {mostActiveMonth.monthName}
              </Text>
              <Text style={styles.highlightSubtitle}>
                You had {mostActiveMonth.meetingCount} meeting{mostActiveMonth.meetingCount !== 1 ? 's' : ''} - that\'s the spirit!
              </Text>
            </View>
          )}

          {/* Top Friends Leaderboard */}
          <View style={styles.leaderboardCard}>
            <View style={styles.leaderboardHeader}>
              <Text style={styles.trophyEmoji}>🏆</Text>
              <Text style={styles.leaderboardTitle}>
                Top Friends by Meetings in {currentYear}
              </Text>
            </View>
            
            {friendStats.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No meetings logged yet this year</Text>
                <Text style={styles.emptyStateSubtext}>Start logging meetings to see your top friends!</Text>
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
                        isTop3 ? styles.friendItemTop3 : styles.friendItemRegular
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
                          <Text style={styles.friendName}>{friend.friend.name}</Text>
                          <View style={styles.friendMeta}>
                            <View style={styles.friendTypeBadge}>
                              <Text style={styles.friendTypeText}>{friend.friend.friendType}</Text>
                            </View>
                            {friend.lastMeeting && (
                              <Text style={styles.lastMeetingText}>
                                Last met: {new Date(friend.lastMeeting).toLocaleDateString()}
                              </Text>
                            )}
                          </View>
                        </View>
                      </View>
                      <View style={styles.friendRight}>
                        <Text style={styles.meetingCount}>{friend.meetingCount}</Text>
                        <Text style={styles.meetingLabel}>
                          meeting{friend.meetingCount !== 1 ? 's' : ''}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {/* Download Previous Years Data - Always visible, greyed out for free users */}
          <TouchableOpacity
            style={[
              styles.downloadButton,
              !isPremium && styles.downloadButtonDisabled
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
                !isPremium && styles.downloadButtonTextDisabled
              ]}>
                Download previous years data
              </Text>
              {!isPremium && (
                <Text style={styles.downloadButtonSubtext}>
                  Premium feature only
                </Text>
              )}
            </View>
          </TouchableOpacity>

          {/* Monthly Chart */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Your {currentYear} Friendship Journey</Text>
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
                          { height: Math.max(height, 4) }
                        ]}
                      >
                        {month.meetingCount > 0 && (
                          <Text style={styles.barValue}>{month.meetingCount}</Text>
                        )}
                      </View>
                    </View>
                    <Text style={styles.monthLabel}>
                      {month.monthName.slice(0, 3)}
                    </Text>
                  </View>
                );
              })}
            </View>
            <Text style={styles.chartFooter}>
              Total meetings across all months: {totalMeetings}
            </Text>
          </View>

          {/* Friendship Memo Preview */}
          <View style={styles.memoCard}>
            <Text style={styles.memoEmoji}>📝</Text>
            <Text style={styles.memoTitle}>Friendship Memo</Text>
            <Text style={styles.memoSubtitle}>
              Feature coming soon! Create yearly notes and memories with your friends.
            </Text>
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonText}>Coming Soon</Text>
            </View>
          </View>

          {/* All Time Stats */}
          <View style={styles.allTimeCard}>
            <Text style={styles.allTimeTitle}>All-Time Friendship Stats</Text>
            <View style={styles.allTimeStats}>
              <View style={styles.allTimeStat}>
                <Text style={styles.allTimeNumber}>{totalMeetings}</Text>
                <Text style={styles.allTimeLabel}>Total Meetings Ever</Text>
              </View>
              <View style={styles.allTimeStat}>
                <Text style={styles.allTimeNumber}>{averageMeetingsPerFriend}</Text>
                <Text style={styles.allTimeLabel}>Avg. All-Time per Friend</Text>
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
    backgroundColor: '#F8F4FF',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F8F4FF',
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
    color: '#333333',
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#666666',
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
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backButtonText: {
    color: '#8000FF',
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
    color: '#333333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8000FF',
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
  purpleGradient: {
    backgroundColor: '#8000FF',
  },
  greenGradient: {
    backgroundColor: '#4CAF50',
  },
  pinkGradient: {
    backgroundColor: '#FF0080',
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
    backgroundColor: 'rgba(255, 165, 0, 0.1)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 165, 0, 0.3)',
  },
  highlightEmoji: {
    fontSize: 32,
    marginBottom: 10,
  },
  highlightTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 8,
  },
  highlightSubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  leaderboardCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
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
    color: '#333333',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 12,
    color: '#999999',
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
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  friendItemRegular: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
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
    color: '#333333',
    marginBottom: 4,
  },
  friendMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  friendTypeBadge: {
    backgroundColor: 'rgba(128, 0, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 255, 0.3)',
  },
  friendTypeText: {
    fontSize: 10,
    color: '#8000FF',
    fontWeight: '600',
  },
  lastMeetingText: {
    fontSize: 10,
    color: '#666666',
  },
  friendRight: {
    alignItems: 'center',
  },
  meetingCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  meetingLabel: {
    fontSize: 10,
    color: '#666666',
  },
  chartCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
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
    backgroundColor: '#8000FF',
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
    color: '#666666',
    textAlign: 'center',
  },
  chartFooter: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    marginTop: 10,
  },
  memoCard: {
    backgroundColor: 'rgba(128, 0, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 255, 0.3)',
  },
  memoEmoji: {
    fontSize: 32,
    marginBottom: 10,
  },
  memoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  memoSubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 15,
  },
  comingSoonBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 255, 0.3)',
  },
  comingSoonText: {
    fontSize: 12,
    color: '#8000FF',
    fontWeight: '600',
  },
  allTimeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 20,
  },
  allTimeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
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
    color: '#333333',
    marginBottom: 5,
  },
  allTimeLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  downloadButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#8000FF',
  },
  downloadButtonDisabled: {
    backgroundColor: '#F5F5F5',
    borderColor: '#CCCCCC',
    opacity: 0.6,
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
    color: '#8000FF',
  },
  downloadButtonTextDisabled: {
    color: '#999999',
    fontStyle: 'italic',
  },
  downloadButtonSubtext: {
    fontSize: 11,
    color: '#999999',
    fontStyle: 'italic',
    marginTop: 2,
  },
});
