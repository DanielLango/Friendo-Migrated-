import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

interface SimpleTimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
}

const ITEM_HEIGHT = 40;
const VISIBLE_ITEMS = 5;

export default function SimpleTimePicker({ value, onChange }: SimpleTimePickerProps) {
  const [selectedHour, setSelectedHour] = useState(value.getHours() % 12 || 12);
  const [selectedMinute, setSelectedMinute] = useState(value.getMinutes());
  const [selectedPeriod, setSelectedPeriod] = useState(value.getHours() >= 12 ? 'PM' : 'AM');

  const hourScrollRef = useRef<ScrollView>(null);
  const minuteScrollRef = useRef<ScrollView>(null);
  const periodScrollRef = useRef<ScrollView>(null);

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const periods = ['AM', 'PM'];

  // Scroll to initial positions on mount
  useEffect(() => {
    setTimeout(() => {
      hourScrollRef.current?.scrollTo({
        y: (selectedHour - 1) * ITEM_HEIGHT,
        animated: false
      });
      minuteScrollRef.current?.scrollTo({
        y: selectedMinute * ITEM_HEIGHT,
        animated: false
      });
      periodScrollRef.current?.scrollTo({
        y: (selectedPeriod === 'PM' ? 1 : 0) * ITEM_HEIGHT,
        animated: false
      });
    }, 100);
  }, []);

  useEffect(() => {
    // Update parent when selection changes
    const newDate = new Date(value);
    let hour24 = selectedHour;
    if (selectedPeriod === 'PM' && selectedHour !== 12) {
      hour24 = selectedHour + 12;
    } else if (selectedPeriod === 'AM' && selectedHour === 12) {
      hour24 = 0;
    }
    newDate.setHours(hour24, selectedMinute);
    onChange(newDate);
  }, [selectedHour, selectedMinute, selectedPeriod]);

  const renderPicker = (
    items: (string | number)[],
    selectedValue: string | number,
    onSelect: (value: any) => void,
    scrollRef: React.RefObject<ScrollView>,
    formatter?: (item: number) => string
  ) => {
    const selectedIndex = items.indexOf(selectedValue);
    
    return (
      <View style={styles.pickerColumn}>
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.y / ITEM_HEIGHT);
            onSelect(items[index]);
          }}
        >
          {/* Top padding */}
          <View style={{ height: ITEM_HEIGHT * 2 }} />
          
          {items.map((item, index) => {
            const displayValue = formatter && typeof item === 'number' ? formatter(item) : item;
            const isSelected = item === selectedValue;
            
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.pickerItem,
                  isSelected && styles.pickerItemSelected
                ]}
                onPress={() => {
                  onSelect(item);
                  scrollRef.current?.scrollTo({
                    y: index * ITEM_HEIGHT,
                    animated: true
                  });
                }}
              >
                <Text
                  style={[
                    styles.pickerItemText,
                    isSelected && styles.pickerItemTextSelected
                  ]}
                >
                  {displayValue}
                </Text>
              </TouchableOpacity>
            );
          })}
          
          {/* Bottom padding */}
          <View style={{ height: ITEM_HEIGHT * 2 }} />
        </ScrollView>
      </View>
    );
  };

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <View style={styles.container}>
      <View style={styles.pickerContainer}>
        {renderPicker(hours, selectedHour, setSelectedHour, hourScrollRef)}
        {renderPicker(minutes, selectedMinute, setSelectedMinute, minuteScrollRef, formatNumber)}
        {renderPicker(periods, selectedPeriod, setSelectedPeriod, periodScrollRef)}
      </View>
      <View style={styles.selectionIndicator} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    position: 'relative',
  },
  pickerContainer: {
    flexDirection: 'row',
    height: '100%',
  },
  pickerColumn: {
    flex: 1,
    height: '100%',
  },
  pickerItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerItemSelected: {
    backgroundColor: 'transparent',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#999999',
  },
  pickerItemTextSelected: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8000FF',
  },
  selectionIndicator: {
    position: 'absolute',
    top: ITEM_HEIGHT * 2,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: 'rgba(128, 0, 255, 0.05)',
  },
});
