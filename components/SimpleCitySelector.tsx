import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';

interface SimpleCitySelectorProps {
  selectedCity: string;
  onCitySelect: (city: string, placeId: string) => void;
  placeholder?: string;
}

const popularCities = [
  // North America
  'New York, NY, USA',
  'Los Angeles, CA, USA',
  'Chicago, IL, USA',
  'Houston, TX, USA',
  'Phoenix, AZ, USA',
  'Philadelphia, PA, USA',
  'San Antonio, TX, USA',
  'San Diego, CA, USA',
  'Dallas, TX, USA',
  'San Jose, CA, USA',
  'Austin, TX, USA',
  'Jacksonville, FL, USA',
  'Fort Worth, TX, USA',
  'Columbus, OH, USA',
  'Charlotte, NC, USA',
  'San Francisco, CA, USA',
  'Indianapolis, IN, USA',
  'Seattle, WA, USA',
  'Denver, CO, USA',
  'Washington, DC, USA',
  'Boston, MA, USA',
  'El Paso, TX, USA',
  'Nashville, TN, USA',
  'Detroit, MI, USA',
  'Oklahoma City, OK, USA',
  'Portland, OR, USA',
  'Las Vegas, NV, USA',
  'Memphis, TN, USA',
  'Louisville, KY, USA',
  'Baltimore, MD, USA',
  'Milwaukee, WI, USA',
  'Albuquerque, NM, USA',
  'Tucson, AZ, USA',
  'Fresno, CA, USA',
  'Mesa, AZ, USA',
  'Sacramento, CA, USA',
  'Atlanta, GA, USA',
  'Kansas City, MO, USA',
  'Colorado Springs, CO, USA',
  'Miami, FL, USA',
  'Raleigh, NC, USA',
  'Omaha, NE, USA',
  'Long Beach, CA, USA',
  'Virginia Beach, VA, USA',
  'Oakland, CA, USA',
  'Minneapolis, MN, USA',
  'Tulsa, OK, USA',
  'Arlington, TX, USA',
  'Tampa, FL, USA',
  'New Orleans, LA, USA',
  'Wichita, KS, USA',
  'Cleveland, OH, USA',
  'Bakersfield, CA, USA',
  'Toronto, ON, Canada',
  'Vancouver, BC, Canada',
  'Mexico City, Mexico',
  
  // Europe - Hungary (Magyar nagyobb városok)
  'Budapest, Hungary',
  'Debrecen, Hungary',
  'Szeged, Hungary',
  'Miskolc, Hungary',
  'Pécs, Hungary',
  'Győr, Hungary',
  'Nyíregyháza, Hungary',
  'Kecskemét, Hungary',
  'Székesfehérvár, Hungary',
  'Szombathely, Hungary',
  'Sopron, Hungary',
  'Makó, Hungary',
  'Tatabánya, Hungary',
  'Kaposvár, Hungary',
  'Veszprém, Hungary',
  'Békéscsaba, Hungary',
  'Zalaegerszeg, Hungary',
  'Szolnok, Hungary',
  'Eger, Hungary',
  'Dunaújváros, Hungary',
  
  // Europe - Denmark (Dan nagyobb városok)
  'Copenhagen, Denmark',
  'Aarhus, Denmark',
  'Odense, Denmark',
  'Aalborg, Denmark',
  'Esbjerg, Denmark',
  'Randers, Denmark',
  'Kolding, Denmark',
  'Horsens, Denmark',
  'Vejle, Denmark',
  'Roskilde, Denmark',
  'Herning, Denmark',
  'Silkeborg, Denmark',
  'Næstved, Denmark',
  'Fredericia, Denmark',
  'Viborg, Denmark',
  'Køge, Denmark',
  'Holstebro, Denmark',
  'Taastrup, Denmark',
  'Slagelse, Denmark',
  'Hillerød, Denmark',
  
  // Europe - Sweden (Svéd nagyobb városok)
  'Stockholm, Sweden',
  'Gothenburg, Sweden',
  'Malmö, Sweden',
  'Uppsala, Sweden',
  'Västerås, Sweden',
  'Örebro, Sweden',
  'Linköping, Sweden',
  'Helsingborg, Sweden',
  'Jönköping, Sweden',
  'Norrköping, Sweden',
  'Lund, Sweden',
  'Umeå, Sweden',
  'Gävle, Sweden',
  'Borås, Sweden',
  'Södertälje, Sweden',
  'Eskilstuna, Sweden',
  'Halmstad, Sweden',
  'Växjö, Sweden',
  'Karlstad, Sweden',
  'Sundsvall, Sweden',
  
  // Europe - Other
  'London, United Kingdom',
  'Paris, France',
  'Berlin, Germany',
  'Madrid, Spain',
  'Rome, Italy',
  'Amsterdam, Netherlands',
  'Barcelona, Spain',
  'Vienna, Austria',
  'Prague, Czech Republic',
  'Oslo, Norway',
  'Helsinki, Finland',
  'Zurich, Switzerland',
  'Brussels, Belgium',
  'Dublin, Ireland',
  'Lisbon, Portugal',
  'Athens, Greece',
  'Warsaw, Poland',
  'Bucharest, Romania',
  'Sofia, Bulgaria',
  'Zagreb, Croatia',
  'Ljubljana, Slovenia',
  'Bratislava, Slovakia',
  'Tallinn, Estonia',
  'Riga, Latvia',
  'Vilnius, Lithuania',
  'Luxembourg City, Luxembourg',
  'Monaco, Monaco',
  'Reykjavik, Iceland',
  'Malta, Malta',
  
  // Asia - China (5+ million cities)
  'Shanghai, China',
  'Beijing, China',
  'Chongqing, China',
  'Tianjin, China',
  'Guangzhou, China',
  'Shenzhen, China',
  'Wuhan, China',
  'Dongguan, China',
  'Chengdu, China',
  'Nanjing, China',
  'Foshan, China',
  'Shenyang, China',
  'Hangzhou, China',
  'Xi\'an, China',
  'Harbin, China',
  'Suzhou, China',
  'Qingdao, China',
  'Dalian, China',
  'Zhengzhou, China',
  'Shantou, China',
  'Jinan, China',
  'Changchun, China',
  'Kunming, China',
  'Changsha, China',
  'Taiyuan, China',
  'Xiamen, China',
  'Hefei, China',
  'Urumqi, China',
  'Fuzhou, China',
  'Wuxi, China',
  'Zhongshan, China',
  'Wenzhou, China',
  'Nanning, China',
  'Ningbo, China',
  
  // Asia - Other
  'Hong Kong, China',
  'Tokyo, Japan',
  'Seoul, South Korea',
  'Singapore, Singapore',
  'Bangkok, Thailand',
  'Manila, Philippines',
  'Jakarta, Indonesia',
  'Kuala Lumpur, Malaysia',
  'Ho Chi Minh City, Vietnam',
  'Hanoi, Vietnam',
  'Mumbai, India',
  'Delhi, India',
  'Bangalore, India',
  'Kolkata, India',
  'Chennai, India',
  'Hyderabad, India',
  'Pune, India',
  'Ahmedabad, India',
  'Islamabad, Pakistan',
  'Karachi, Pakistan',
  'Lahore, Pakistan',
  'Dhaka, Bangladesh',
  'Colombo, Sri Lanka',
  'Kathmandu, Nepal',
  'Thimphu, Bhutan',
  'Ulaanbaatar, Mongolia',
  'Almaty, Kazakhstan',
  'Tashkent, Uzbekistan',
  'Bishkek, Kyrgyzstan',
  'Dushanbe, Tajikistan',
  'Ashgabat, Turkmenistan',
  'Baku, Azerbaijan',
  'Yerevan, Armenia',
  'Tbilisi, Georgia',
  'Tehran, Iran',
  'Baghdad, Iraq',
  'Damascus, Syria',
  'Beirut, Lebanon',
  'Amman, Jordan',
  'Kuwait City, Kuwait',
  'Doha, Qatar',
  'Abu Dhabi, UAE',
  'Dubai, UAE',
  'Muscat, Oman',
  'Sanaa, Yemen',
  'Riyadh, Saudi Arabia',
  'Jeddah, Saudi Arabia',
  'Manama, Bahrain',
  'Tel Aviv, Israel',
  'Jerusalem, Israel',
  'Ankara, Turkey',
  'Istanbul, Turkey',
  'Nicosia, Cyprus',
  
  // Africa
  'Cairo, Egypt',
  'Lagos, Nigeria',
  'Johannesburg, South Africa',
  'Cape Town, South Africa',
  'Nairobi, Kenya',
  'Addis Ababa, Ethiopia',
  'Accra, Ghana',
  'Dakar, Senegal',
  'Casablanca, Morocco',
  'Rabat, Morocco',
  'Tunis, Tunisia',
  'Algiers, Algeria',
  'Tripoli, Libya',
  'Khartoum, Sudan',
  'Kampala, Uganda',
  'Dar es Salaam, Tanzania',
  'Kigali, Rwanda',
  'Bujumbura, Burundi',
  'Kinshasa, DR Congo',
  'Brazzaville, Republic of Congo',
  'Libreville, Gabon',
  'Yaoundé, Cameroon',
  'Bangui, Central African Republic',
  'Ndjamena, Chad',
  'Niamey, Niger',
  'Ouagadougou, Burkina Faso',
  'Bamako, Mali',
  'Conakry, Guinea',
  'Freetown, Sierra Leone',
  'Monrovia, Liberia',
  'Abidjan, Côte d\'Ivoire',
  'Lomé, Togo',
  'Porto-Novo, Benin',
  'Abuja, Nigeria',
  'Windhoek, Namibia',
  'Gaborone, Botswana',
  'Maseru, Lesotho',
  'Mbabane, Eswatini',
  'Maputo, Mozambique',
  'Harare, Zimbabwe',
  'Lusaka, Zambia',
  'Lilongwe, Malawi',
  'Antananarivo, Madagascar',
  'Port Louis, Mauritius',
  'Victoria, Seychelles',
  'Moroni, Comoros',
  
  // Oceania
  'Sydney, Australia',
  'Melbourne, Australia',
  'Brisbane, Australia',
  'Perth, Australia',
  'Adelaide, Australia',
  'Canberra, Australia',
  'Auckland, New Zealand',
  'Wellington, New Zealand',
  'Christchurch, New Zealand',
  'Suva, Fiji',
  'Port Moresby, Papua New Guinea',
  'Nuku\'alofa, Tonga',
  'Apia, Samoa',
  'Port Vila, Vanuatu',
  'Honiara, Solomon Islands',
  'Tarawa, Kiribati',
  'Funafuti, Tuvalu',
  'Yaren, Nauru',
  'Ngerulmud, Palau',
  'Majuro, Marshall Islands',
  'Palikir, Micronesia',
  
  // South America
  'São Paulo, Brazil',
  'Rio de Janeiro, Brazil',
  'Buenos Aires, Argentina',
  'Lima, Peru',
  'Bogotá, Colombia',
  'Santiago, Chile',
  'Caracas, Venezuela',
  'Quito, Ecuador',
  'La Paz, Bolivia',
  'Asunción, Paraguay',
  'Montevideo, Uruguay',
  'Georgetown, Guyana',
  'Paramaribo, Suriname',
  'Cayenne, French Guiana',
  'Brasília, Brazil',
  'Medellín, Colombia',
  'Cali, Colombia',
  'Guadalajara, Mexico',
  'Monterrey, Mexico',
  'Puebla, Mexico',
  'Tijuana, Mexico',
  'León, Mexico',
  'Juárez, Mexico',
  'Zapopan, Mexico',
  'Nezahualcóyotl, Mexico',
  
  // Caribbean
  'Havana, Cuba',
  'Kingston, Jamaica',
  'Santo Domingo, Dominican Republic',
  'Port-au-Prince, Haiti',
  'San Juan, Puerto Rico',
  'Nassau, Bahamas',
  'Bridgetown, Barbados',
  'Port of Spain, Trinidad and Tobago',
  'Georgetown, Guyana',
  'Paramaribo, Suriname',
  'Willemstad, Curaçao',
  'Oranjestad, Aruba',
  'Philipsburg, Sint Maarten',
  'Charlotte Amalie, US Virgin Islands',
  'Road Town, British Virgin Islands',
  'The Valley, Anguilla',
  'Gustavia, Saint Barthélemy',
  'Marigot, Saint Martin',
  'Basseterre, Saint Kitts and Nevis',
  'Plymouth, Montserrat',
  'Saint John\'s, Antigua and Barbuda',
  'Roseau, Dominica',
  'Castries, Saint Lucia',
  'Kingstown, Saint Vincent and the Grenadines',
  'Saint George\'s, Grenada',
];

export default function SimpleCitySelector({ 
  selectedCity, 
  onCitySelect, 
  placeholder = "Select city..." 
}: SimpleCitySelectorProps) {
  const [showSelector, setShowSelector] = useState(false);
  const [searchText, setSearchText] = useState('');

  const handleCitySelect = (city: string) => {
    onCitySelect(city, city); // Use city name as placeId for simplicity
    setShowSelector(false);
    setSearchText('');
  };

  // Filter cities based on search text
  const filteredCities = popularCities.filter(city =>
    city.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.citySelector}
        onPress={() => setShowSelector(!showSelector)}
      >
        <Text style={[
          styles.citySelectorText,
          !selectedCity && styles.placeholderText
        ]}>
          {selectedCity || placeholder}
        </Text>
        <Text style={styles.dropdownIcon}>{showSelector ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {showSelector && (
        <View style={styles.cityListContainer}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search cities..."
              value={searchText}
              onChangeText={setSearchText}
              autoFocus={true}
            />
          </View>
          <ScrollView style={styles.cityList} nestedScrollEnabled>
            {filteredCities.length > 0 ? (
              filteredCities.map((city) => (
                <TouchableOpacity
                  key={city}
                  style={[
                    styles.cityOption,
                    selectedCity === city && styles.cityOptionSelected
                  ]}
                  onPress={() => handleCitySelect(city)}
                >
                  <Text style={[
                    styles.cityOptionText,
                    selectedCity === city && styles.cityOptionTextSelected
                  ]}>
                    {city}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsText}>
                  No cities found matching "{searchText}"
                </Text>
                <Text style={styles.noResultsSubtext}>
                  Try a different search term
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}

      {selectedCity && (
        <View style={styles.selectedCityDisplay}>
          <Text style={styles.selectedCityIcon}>📍</Text>
          <Text style={styles.selectedCityText}>{selectedCity}</Text>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => onCitySelect('', '')}
          >
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  citySelector: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  citySelectorText: {
    fontSize: 16,
    color: '#333333',
  },
  placeholderText: {
    color: '#999999',
  },
  dropdownIcon: {
    fontSize: 12,
    color: '#666666',
  },
  cityListContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    maxHeight: 300,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  searchContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  searchInput: {
    backgroundColor: '#F8F8F8',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  cityList: {
    maxHeight: 250,
  },
  cityOption: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  cityOptionSelected: {
    backgroundColor: '#8000FF',
  },
  cityOptionText: {
    fontSize: 16,
    color: '#333333',
  },
  cityOptionTextSelected: {
    color: '#FFFFFF',
  },
  noResultsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 4,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
  selectedCityDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#8000FF',
  },
  selectedCityIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  selectedCityText: {
    flex: 1,
    fontSize: 14,
    color: '#8000FF',
    fontWeight: '500',
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    fontSize: 12,
    color: '#999999',
  },
});
