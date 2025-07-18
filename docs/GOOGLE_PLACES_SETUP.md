# Google Places API Setup

## Environment Variables Required

Add the following to your `.env.local` file:

```
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
```

## Getting a Google Places API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Places API
4. Create credentials (API Key)
5. Restrict the API key to Places API for security
6. Add the key to your `.env.local` file

## Features Implemented

### City Selection
- Google Places Autocomplete for city selection
- Clean city display with location icon
- Easy city clearing functionality

### Venue Suggestions
- Dynamic venue loading based on activity type and city
- Support for manual "top 5" venues (infrastructure ready)
- Rating and price level display
- Fallback to mock data when API is not configured

### Future Enhancements
- Real Google Places API integration
- Manual top 5 venue management
- Venue photos and additional details
- User reviews and ratings