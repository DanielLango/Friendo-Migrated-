import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../utils/themeContext';

export default function TermsOfServiceScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.purple} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Terms of Service</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={true}>
        <View style={styles.section}>
          <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>
            Last Updated: January 2025
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>1. ACCEPTANCE OF TERMS</Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            By accessing or using Friendo ("the App"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not use the App. These Terms constitute a legally binding agreement between you and Friendo.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>2. DESCRIPTION OF SERVICE</Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            Friendo is a personal relationship management application that helps users track and maintain connections with friends. The App provides features including but not limited to:
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Friend list management (up to 50 friends for free users, 1,000 for premium users)
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Meeting scheduling and tracking
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Reminder notifications
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Statistics and analytics on friend interactions
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Premium features including profile pictures, birthday reminders, cancellation tracking, dark mode, and batch notifications
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>3. USER ACCOUNTS AND REGISTRATION</Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            3.1. You must create an account to use the App. You agree to provide accurate, current, and complete information during registration.
          </Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            3.2. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
          </Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            3.3. You must be at least 13 years of age to use the App. If you are under 18, you must have parental or guardian consent.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>4. USER CONTENT AND CONDUCT</Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            4.1. You retain ownership of all content you submit to the App, including friend information, meeting notes, and profile pictures.
          </Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            4.2. By uploading content, you grant Friendo a non-exclusive, worldwide license to store, process, and display such content solely for the purpose of providing the service to you.
          </Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            4.3. You represent and warrant that:
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • You have obtained all necessary consents from individuals whose personal information you enter into the App
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • You have the right to upload any profile pictures or images you submit
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • All identifiable persons in uploaded images have consented to such upload
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Your content does not violate any third-party rights or applicable laws
          </Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            4.4. You agree to immediately remove any content if requested by any person depicted in such content.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>5. PROFILE PICTURES AND IMAGE UPLOADS</Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            5.1. Premium users may upload profile pictures for their friends. By uploading images, you confirm that:
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • You have obtained explicit consent from every identifiable person in the image
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • The image is from a consented or publicly available source
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • You will delete the image if any depicted person requests removal
          </Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            5.2. Friendo stores images privately in secure cloud storage (Supabase) and does not share them publicly or with third parties.
          </Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            5.3. You are solely responsible for ensuring compliance with all applicable privacy laws and regulations regarding image uploads.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>6. DATA COLLECTION AND PRIVACY</Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            6.1. We collect and process personal information as described in our Privacy Policy, which is incorporated into these Terms by reference.
          </Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            6.2. Information we collect includes:
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Account information (email address, password)
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Friend information you manually enter (names, contact details, birthdays)
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Meeting records and notes
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Profile pictures (premium users only)
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Usage data and analytics
          </Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            6.3. We use Supabase for secure data storage and authentication. All data is encrypted in transit and at rest.
          </Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            6.4. We do not sell, rent, or share your personal information with third parties for marketing purposes.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>7. PREMIUM SUBSCRIPTION</Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            7.1. Friendo offers a premium subscription ("Pro") for $0.99 per month, providing access to enhanced features.
          </Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            7.2. Subscriptions are billed through your Apple App Store or Google Play Store account and are subject to their respective terms and conditions.
          </Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            7.3. Subscriptions automatically renew unless cancelled at least 24 hours before the end of the current period.
          </Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            7.4. You may cancel your subscription at any time through your App Store or Play Store account settings.
          </Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            7.5. No refunds are provided for partial subscription periods.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>8. PROHIBITED CONDUCT</Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            You agree not to:
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Use the App for any illegal purpose or in violation of any laws
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Upload content that infringes on third-party rights
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Upload images without proper consent from depicted individuals
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Attempt to gain unauthorized access to the App or its systems
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Use the App to harass, stalk, or harm others
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Reverse engineer, decompile, or disassemble the App
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Use automated systems to access the App without permission
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>9. INTELLECTUAL PROPERTY</Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            9.1. The App and all its content, features, and functionality are owned by Friendo and are protected by copyright, trademark, and other intellectual property laws.
          </Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            9.2. You are granted a limited, non-exclusive, non-transferable license to use the App for personal, non-commercial purposes.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>10. DISCLAIMERS AND LIMITATIONS OF LIABILITY</Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            10.1. THE APP IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
          </Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            10.2. WE DO NOT WARRANT THAT THE APP WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE.
          </Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            10.3. TO THE MAXIMUM EXTENT PERMITTED BY LAW, FRIENDO SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE APP.
          </Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            10.4. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID FOR THE SERVICE IN THE TWELVE MONTHS PRECEDING THE CLAIM.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>11. INDEMNIFICATION</Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            You agree to indemnify, defend, and hold harmless Friendo and its officers, directors, employees, and agents from any claims, liabilities, damages, losses, and expenses arising from:
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Your violation of these Terms
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Your violation of any third-party rights, including privacy rights
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Your uploaded content, including images without proper consent
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Your use or misuse of the App
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>12. TERMINATION</Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            12.1. You may terminate your account at any time by contacting us or deleting the App.
          </Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            12.2. We reserve the right to suspend or terminate your account if you violate these Terms or engage in conduct that we deem harmful to the App or other users.
          </Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            12.3. Upon termination, your right to use the App will immediately cease, and we may delete your data in accordance with our data retention policies.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>13. CHANGES TO TERMS</Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            We reserve the right to modify these Terms at any time. We will notify you of material changes by posting the updated Terms in the App or via email. Your continued use of the App after such changes constitutes acceptance of the modified Terms.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>14. GOVERNING LAW AND DISPUTE RESOLUTION</Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            14.1. These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Friendo operates, without regard to conflict of law principles.
          </Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            14.2. Any disputes arising from these Terms or your use of the App shall be resolved through binding arbitration, except where prohibited by law.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>15. MISCELLANEOUS</Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            15.1. These Terms constitute the entire agreement between you and Friendo regarding the App.
          </Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            15.2. If any provision of these Terms is found to be unenforceable, the remaining provisions shall remain in full force and effect.
          </Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            15.3. Our failure to enforce any right or provision shall not constitute a waiver of such right or provision.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>16. CONTACT INFORMATION</Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            If you have any questions about these Terms, please contact us through the App or visit ambrozitestudios.com.
          </Text>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textTertiary }]}>
              By using Friendo, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  lastUpdated: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 8,
    paddingLeft: 10,
  },
  footer: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  footerText: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});