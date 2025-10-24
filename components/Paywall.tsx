import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Linking, Image, ScrollView, ActivityIndicator, Alert } from 'react-native';
import Purchases, { PurchasesPackage, CustomerInfo } from 'react-native-purchases';
import { Ionicons } from '@expo/vector-icons';
import { getSubscriptionPackages } from '../utils/revenueCatConfig';
import { clearPremiumCache } from '../utils/premiumFeatures';

/**
 * Friendo Paywall
 * - White & purple theme
 * - Emotional copy (mission-driven)
 * - Two plans: $0.99/mo, $9.99/yr
 * - RevenueCat integration
 */

// ---- THEME ----
const PURPLE = '#8000FF';
const DARK = '#0F1222';
const MUTED = '#606276';
const GREEN = '#1DB954';

const HEADER_URI = 'https://images.unsplash.com/photo-1514846326716-43f660c31c2a?q=80&w=1200&auto=format&fit=crop';

export type PaywallProps = {
  onSuccess?: (info: CustomerInfo) => void;
  onClose?: () => void;
};

export default function Paywall({ onSuccess, onClose }: PaywallProps) {
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      const pkgs = await getSubscriptionPackages();
      setPackages(pkgs);
      
      // Default select yearly if present
      if (pkgs.length > 0) {
        setSelectedId(pkgs[0]?.identifier ?? null);
      }
    } catch (e: any) {
      console.log('Could not load offerings:', e?.message);
      Alert.alert(
        'Preview Mode', 
        'RevenueCat requires a development build. This is a preview of the paywall design.'
      );
    } finally {
      setLoading(false);
    }
  };

  const selectedPkg = useMemo(() => packages.find(p => p.identifier === selectedId) || null, [packages, selectedId]);

  async function onPurchase() {
    if (!selectedPkg) return;
    try {
      setPurchasing(true);
      const { customerInfo } = await Purchases.purchasePackage(selectedPkg);
      await clearPremiumCache();
      
      const active = customerInfo.entitlements.active['pro'];
      if (active) {
        Alert.alert('Welcome to Premium! 🎉', 'Thank you for supporting Friendo!');
        onSuccess?.(customerInfo);
      } else {
        Alert.alert('Purchase', 'Thanks! Your subscription will activate shortly.');
      }
    } catch (e: any) {
      if (e?.userCancelled) return;
      Alert.alert('Purchase failed', e?.message ?? 'Please try again.');
    } finally {
      setPurchasing(false);
    }
  }

  async function onRestore() {
    try {
      setPurchasing(true);
      const customerInfo = await Purchases.restorePurchases();
      await clearPremiumCache();
      
      const active = customerInfo.entitlements.active['pro'];
      if (active) {
        Alert.alert('Restored! 🎉', 'Your premium subscription has been restored.');
        onSuccess?.(customerInfo);
      } else {
        Alert.alert('Nothing to restore', 'No active Friendo Premium found.');
      }
    } catch (e: any) {
      Alert.alert('Restore failed', e?.message ?? 'Please try again.');
    } finally {
      setPurchasing(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      {/* Header image + close button */}
      <View style={{ height: 180, overflow: 'hidden', borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}>
        <Image source={{ uri: HEADER_URI }} style={{ width: '100%', height: '100%' }} />
        {onClose && (
          <TouchableOpacity
            onPress={onClose}
            style={{ position: 'absolute', right: 16, top: 16, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 24, padding: 8 }}>
            <Ionicons name="close" size={20} color={DARK} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 28 }}>
        {/* Mission copy */}
        <Text style={{ fontSize: 28, fontWeight: '800', color: DARK, lineHeight: 32 }}>Say hello to your best self.</Text>
        <Text style={{ marginTop: 6, color: MUTED }}>
          Friendo brings friends together. I\'m a one‑person studio building this with love. If you believe in the mission, your support keeps the lights on and helps more friends connect.
        </Text>

        {/* Value bullets */}
        <View style={{ marginTop: 16, gap: 10 }}>
          <Bullet title="Never lose touch" subtitle="Gentle reminders to meet the people who matter." />
          <Bullet title="Plan faster" subtitle="Smart venue picks and friction‑free scheduling." />
          <Bullet title="Meaningful memories" subtitle="Track who you met and when—stay close." />
        </View>

        {/* Plans */}
        <Text style={{ marginTop: 22, color: DARK, fontWeight: '700' }}>Select a plan</Text>
        {loading ? (
          <View style={{ paddingVertical: 24 }}>
            <ActivityIndicator />
          </View>
        ) : (
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
            {packages.map((pkg) => (
              <PlanCard
                key={pkg.identifier}
                title={pkg.packageType === 'ANNUAL' ? 'YEARLY' : 'MONTHLY'}
                priceLine={pkg.product.priceString || (pkg.packageType === 'ANNUAL' ? '$9.99/yr' : '$0.99/mo')}
                subline={pkg.packageType === 'ANNUAL' ? 'Best value' : 'Flexibility'}
                selected={selectedId === pkg.identifier}
                onPress={() => setSelectedId(pkg.identifier)}
                highlight={pkg.packageType === 'ANNUAL'}
              />
            ))}
          </View>
        )}

        {/* Legal + CTA */}
        <Text style={{ marginTop: 8, color: MUTED, fontSize: 12 }}>Change plans or cancel anytime.</Text>

        <TouchableOpacity
          onPress={onPurchase}
          disabled={!selectedPkg || purchasing}
          style={{
            marginTop: 14,
            backgroundColor: PURPLE,
            paddingVertical: 14,
            borderRadius: 14,
            alignItems: 'center',
            shadowColor: PURPLE,
            shadowOpacity: 0.25,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 8 },
            opacity: purchasing ? 0.7 : 1,
          }}>
          {purchasing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '800' }}>Support Friendo</Text>
          )}
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 12 }}>
          <TouchableOpacity onPress={onRestore}><Text style={{ color: PURPLE, fontWeight: '700' }}>Restore</Text></TouchableOpacity>
          <Dot />
          <TouchableOpacity onPress={() => Linking.openURL('https://www.ambrozitestudios.com/about')}>
            <Text style={{ color: PURPLE, fontWeight: '700' }}>About Friendo</Text>
          </TouchableOpacity>
        </View>

        <Text style={{ color: MUTED, fontSize: 11, marginTop: 12, textAlign: 'center' }}>
          By subscribing you agree to the Terms & Privacy. Your subscription renews automatically until cancelled in your account settings.
        </Text>
      </ScrollView>
    </View>
  );
}

function Dot() {
  return <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#D7D8E0', alignSelf: 'center' }} />;
}

function Bullet({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 10 }}>
      <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#F3EDFF', alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="star" size={16} color={PURPLE} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: DARK, fontWeight: '700' }}>{title}</Text>
        <Text style={{ color: MUTED }}>{subtitle}</Text>
      </View>
    </View>
  );
}

function PlanCard({ title, priceLine, subline, selected, onPress, highlight }: {
  title: string;
  priceLine: string;
  subline?: string;
  selected?: boolean;
  highlight?: boolean;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={{ flex: 1 }}>
      <View
        style={{
          borderWidth: 2,
          borderColor: selected ? PURPLE : '#E7E8EF',
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          padding: 14,
          gap: 2,
          shadowColor: '#000',
          shadowOpacity: 0.04,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: DARK, fontWeight: '800' }}>{title}</Text>
          {selected ? (
            <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: PURPLE, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="checkmark" size={14} color="white" />
            </View>
          ) : (
            <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#E1E2EA' }} />
          )}
        </View>
        <Text style={{ color: DARK, fontSize: 18, fontWeight: '900' }}>{priceLine}</Text>
        {!!subline && <Text style={{ color: MUTED }}>{subline}</Text>}
        {highlight && (
          <View style={{ marginTop: 6, alignSelf: 'flex-start', backgroundColor: '#E9FAEF', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
            <Text style={{ color: GREEN, fontWeight: '800', fontSize: 11 }}>BEST VALUE</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}