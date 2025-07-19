# Google Places API Setup Guide

This guide explains how to set up Google Places API for city and venue selection in the Friendo app.

## 🚀 Quick Setup Steps

### 1. Google Cloud Console Setup

1. **Create a Google Cloud Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Note your project ID

2. **Enable APIs**:
   - Go to "APIs & Services" > "Library"
   - Search and enable:
     - **Places API** (for city autocomplete)
     - **Places API (New)** (recommended for better features)
     - **Geocoding API** (optional, for coordinates)

3. **Create API Key**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the generated API key

4. **Secure Your API Key**:
   - Click on your API key to edit
   - Under "API restrictions", select "Restrict key"
   - Choose the APIs you enabled above
   - Under "Application restrictions", choose appropriate option:
     - For development: "None"
     - For production: "HTTP referrers" or "Android/iOS apps"

### 2. Environment Configuration

Add your API key to `.env.local`:

```env
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=your_api_key_here
```

### 3. Billing Setup (Required)

⚠️ **Important**: Google Places API requires billing to be enabled, even for the free tier.

1. Go to "Billing" in Google Cloud Console
2. Link a payment method
3. Set up budget alerts to monitor usage

## 💰 Pricing Information

### Google Places API Costs:
- **Autocomplete (per session)**: $2.83 per 1,000 requests
- **Place Details**: $17 per 1,000 requests  
- **Text Search**: $32 per 1,000 requests
- **Nearby Search**: $32 per 1,000 requests

### Free Tier:
- $200 monthly credit for new users
- Covers ~70,000 autocomplete requests per month

### Cost Optimization Tips:
1. **Use session tokens** for autocomplete (reduces cost)
2. **Cache results** locally when possible
3. **Implement debouncing** to reduce API calls
4. **Set usage quotas** to prevent unexpected charges

## 🔧 Implementation Details

### Current Implementation Status:
- ✅ **SimpleCitySelector**: Works with 50 pre-defined US cities (no API required)
- 🔄 **CitySelector**: Ready for Google Places API (requires setup above)
- 🔄 **VenueSelector**: Uses mock data (can be enhanced with Places API)

### To Enable Google Places:

1. **Complete setup steps above**
2. **Update MeetingCreateScreen.tsx**:
   ```typescript
   // Change this line:
   import SimpleCitySelector from '../components/SimpleCitySelector';
   
   // To this:
   import CitySelector from '../components/CitySelector';
   ```

3. **Update the component usage**:
   ```typescript
   // Change:
   <SimpleCitySelector
   
   // To:
   <CitySelector
   ```

### Features You Get with Google Places:
- 🌍 **Global city coverage** (not just US)
- 🔍 **Real-time search** as user types
- 📍 **Accurate coordinates** for each location
- 🏢 **Venue suggestions** based on location
- 🎯 **Smart autocomplete** with context

## 🧪 Testing Your Setup

### Test API Key:
```bash
curl "https://maps.googleapis.com/maps/api/place/autocomplete/json?input=New%20York&types=(cities)&key=YOUR_API_KEY"
```

### Expected Response:
```json
{
  "predictions": [
    {
      "description": "New York, NY, USA",
      "place_id": "ChIJOwg_06VPwokRYv534QaPC8g",
      ...
    }
  ],
  "status": "OK"
}
```

## 🚨 Common Issues

### "This API project is not authorized to use this API"
- **Solution**: Enable Places API in Google Cloud Console

### "The provided API key is invalid"
- **Solution**: Check API key is correct and not restricted

### "You must enable Billing on the Google Cloud Project"
- **Solution**: Add billing information in Google Cloud Console

### High API costs
- **Solution**: Implement session tokens and caching

## 🔮 Alternative Solutions

### If Google Places is too expensive:

1. **Keep SimpleCitySelector**: Works great for US cities
2. **Use OpenStreetMap Nominatim**: Free geocoding API
3. **Mapbox Places API**: Often cheaper than Google
4. **Here Places API**: Another alternative

### Hybrid Approach:
- Use SimpleCitySelector for common cities
- Fall back to Google Places for international/uncommon locations

## 📱 Production Considerations

### Security:
- Never expose API keys in client code for production
- Use server-side proxy for API calls
- Implement rate limiting

### Performance:
- Cache popular city results
- Implement offline fallback
- Use session tokens to reduce costs

### User Experience:
- Show loading states during API calls
- Handle network errors gracefully
- Provide fallback to manual entry

## 🎯 Recommendation

For **Friendo app specifically**:

1. **Start with SimpleCitySelector** (current implementation)
   - No setup required
   - No ongoing costs
   - Covers most US users

2. **Upgrade to Google Places later** when:
   - You have international users
   - You want venue suggestions
   - Budget allows for API costs

3. **Consider hybrid approach**:
   - SimpleCitySelector for common cities
   - Google Places for "Other" option

This gives you the best of both worlds: immediate functionality with option to enhance later.