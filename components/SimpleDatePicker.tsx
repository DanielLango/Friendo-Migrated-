import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';

interface SimpleDatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  minimumDate?: Date;
}

const ITEM_HEIGHT = 40;
const VISIBLE_ITEMS = 5;

export default function SimpleDatePicker({ value, onChange, minimumDate }: SimpleDatePickerProps) {
  const currentDate = minimumDate || new Date();
  const [selectedMonth, setSelectedMonth] = useState(value.getMonth());
  const [selectedDay, setSelectedDay] = useState(value.getDate());
  const [selectedYear, setSelectedYear] = useState(value.getFullYear());

  const monthScrollRef = useRef<ScrollView>(null);
  const dayScrollRef = useRef<ScrollView>(null);
  const yearScrollRef = useRef<ScrollView>(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate years (current year + 5 years into future)
  const years = Array.from({ length: 6 }, (_, i) => currentDate.getFullYear() + i);

  // Get days in selected month
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  useEffect(() => {
    // Update parent when selection changes
    const newDate = new Date(selectedYear, selectedMonth, selectedDay);
    onChange(newDate);
  }, [selectedMonth, selectedDay, selectedYear]);

  const renderPicker = (
    items: (string | number)[],
    selectedIndex: number,
    onSelect: (index: number) => void,
    scrollRef: React.RefObject<ScrollView>
  ) => {
    return (
      <View style={styles.pickerColumn}>
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.y / ITEM_HEIGHT);
            onSelect(index);
          }}
        >
          {/* Top padding */}
          <View style={{ height: ITEM_HEIGHT * 2 }} />
          
          {items.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.pickerItem,
                index === selectedIndex && styles.pickerItemSelected
              ]}
              onPress={() => {
                onSelect(index);
                scrollRef.current?.scrollTo({
                  y: index * ITEM_HEIGHT,
                  animated: true
                });
              }}
            >
              <Text
                style={[
                  styles.pickerItemText,
                  index === selectedIndex && styles.pickerItemTextSelected
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
          
          {/* Bottom padding */}
          <View style={{ height: ITEM_HEIGHT * 2 }} />
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.pickerContainer}>
        {renderPicker(months, selectedMonth, setSelectedMonth, monthScrollRef)}
        {renderPicker(days, selectedDay - 1, (index) => setSelectedDay(index + 1), dayScrollRef)}
        {renderPicker(years, years.indexOf(selectedYear), (index) => setSelectedYear(years[index]), yearScrollRef)}
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