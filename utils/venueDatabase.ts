export const venueDatabase = {
  'New York, NY, USA': {
    restaurant: ['Joe\'s Pizza', 'Katz\'s Delicatessen', 'Peter Luger', 'Lombardi\'s', 'The Halal Guys'],
    bar: ['McSorley\'s Old Ale House', 'Dead Rabbit', 'Please Don\'t Tell', 'Employees Only', 'Angel\'s Share'],
    cafe: ['Blue Bottle Coffee', 'Stumptown Coffee', 'Joe Coffee', 'Birch Coffee', 'Gregory\'s Coffee'],
    park: ['Central Park', 'Bryant Park', 'Washington Square Park', 'High Line', 'Prospect Park'],
  },
  'London, United Kingdom': {
    restaurant: ['Dishoom', 'Sketch', 'Duck & Waffle', 'Hawksmoor', 'Barrafina'],
    bar: ['Nightjar', 'Connaught Bar', 'American Bar', 'Zetter Townhouse', 'Callooh Callay'],
    cafe: ['Monmouth Coffee', 'Workshop Coffee', 'Ozone Coffee', 'Kaffeine', 'Fernandez & Wells'],
    park: ['Hyde Park', 'Regent\'s Park', 'Greenwich Park', 'Hampstead Heath', 'St. James\'s Park'],
  },
  'Tokyo, Japan': {
    restaurant: ['Sukiyabashi Jiro', 'Narisawa', 'Den', 'Florilège', 'L\'Effervescence'],
    bar: ['New York Bar', 'Bar High Five', 'Tender Bar', 'Bar Benfiddich', 'Cocktail Works'],
    cafe: ['Blue Seal Coffee', 'Streamer Coffee', 'Fuglen Tokyo', 'Little Nap Coffee', 'Onibus Coffee'],
    park: ['Ueno Park', 'Shinjuku Gyoen', 'Yoyogi Park', 'Imperial Palace Gardens', 'Inokashira Park'],
  },
  // Add more cities as needed...
};

export const getVenuesForCity = (city: string, venueType: string): string[] => {
  const cityVenues = venueDatabase[city as keyof typeof venueDatabase];
  if (cityVenues && cityVenues[venueType as keyof typeof cityVenues]) {
    return cityVenues[venueType as keyof typeof cityVenues];
  }
  
  // Fallback to generated venues if city not in database
  return generateVenuesForCity(city, venueType);
};