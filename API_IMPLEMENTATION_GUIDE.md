# 📋 API Implementation Guide - VillageVault

## ✅ Implementation Status

### 1. Infermedica Engine API (Health Check)

**Status**: ✅ **Correctly Implemented**  
**Base URL**: `https://api.infermedica.com/v3`  
**Documentation**: [Infermedica Engine API Quickstart](https://developer.infermedica.com/docs/engine-api/quickstart)

#### Current Implementation ✅

**Request Format** (per official docs):
```javascript
POST https://api.infermedica.com/v3/diagnosis
Headers:
  App-Id: your-app-id
  App-Key: your-app-key
  Content-Type: application/json
  Interview-Id: optional (recommended)

Body:
{
  "sex": "male" | "female",
  "age": {
    "value": 30  // ✅ Now correctly formatted as object
  },
  "evidence": [
    {
      "id": "s_1193",
      "choice_id": "present",  // present | absent | unknown
      "source": "initial"  // optional, for initial symptom
    }
  ],
  "extras": {
    "enable_triage_5": true,
    "enable_explanations": true,
    "disable_groups": false  // set true to disable group questions
  }
}
```

**Response Format**:
```json
{
  "question": {
    "type": "single" | "group_single" | "group_multiple",
    "text": "Do you have a fever?",
    "items": [...],
    "extras": {}
  },
  "conditions": [
    {
      "id": "c_49",
      "name": "Migraine",
      "probability": 0.4532
    }
  ],
  "should_stop": true | false
}
```

#### Key Features Implemented ✅

1. ✅ **Symptom Search** - `/search` endpoint with autocomplete
2. ✅ **Symptom Analysis** - `/diagnosis` endpoint with proper age format
3. ✅ **Triage Recommendations** - `/triage` endpoint
4. ✅ **Fallback System** - Works without API keys
5. ✅ **Proper Evidence Format** - `choice_id` (present/absent/unknown)
6. ✅ **Initial Symptom Support** - Can mark symptoms as initial

#### Important Notes 📝

According to [official docs](https://developer.infermedica.com/docs/engine-api/quickstart):

1. **Stateless API**: Each request must include ALL evidence gathered so far
2. **Age Format**: Age must be an object `{ value: 30 }`, not just `30`
3. **Evidence States**: `present`, `absent`, or `unknown`
4. **Initial Symptoms**: Mark chief complaint with `"source": "initial"`
5. **Group Questions**: Can be disabled with `"disable_groups": true` in extras
6. **Should Stop**: Flag indicates when interview should end

#### Frontend Implementation ✅

The frontend correctly:
- ✅ Sends age as number (converted in backend)
- ✅ Formats evidence with `choice_id: "present"`
- ✅ Handles symptom selection
- ✅ Displays question, conditions, and triage recommendations

---

### 2. Open-Meteo Weather API

**Status**: ✅ **Correctly Implemented**  
**Base URL**: `https://api.open-meteo.com/v1`  
**Documentation**: [Open-Meteo Weather Forecast API](https://open-meteo.com/en/docs)

#### Current Implementation ✅

**Request Format** (per official docs):
```
GET https://api.open-meteo.com/v1/forecast
Parameters:
  latitude: 52.52 (required)
  longitude: 13.41 (required)
  current: temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m
  hourly: temperature_2m,precipitation,weather_code
  daily: weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max
  timezone: auto
  forecast_days: 7 (default) | up to 16
```

**Response Format**:
```json
{
  "latitude": 52.52,
  "longitude": 13.419,
  "generationtime_ms": 0.063,
  "timezone": "Europe/Berlin",
  "hourly": {
    "time": ["2025-11-02T00:00", ...],
    "temperature_2m": [12.8, 12.4, ...]
  },
  "daily": {
    "time": ["2025-11-02", ...],
    "temperature_2m_max": [13.4, ...],
    "precipitation_sum": [0, ...]
  },
  "current": {
    "temperature_2m": 12.8,
    "weather_code": 0
  }
}
```

#### Key Features Implemented ✅

1. ✅ **Current Weather** - Current conditions
2. ✅ **Hourly Forecast** - 168 hours (7 days) or up to 16 days
3. ✅ **Daily Forecast** - Aggregated daily values
4. ✅ **Agricultural Data** - Soil temperature, soil moisture
5. ✅ **Weather Codes** - WMO weather interpretation codes
6. ✅ **Agricultural Insights** - Crop advice, farming tips, alerts

#### Agricultural Weather Parameters ✅

We're correctly using:
- `soil_temperature_0cm` - Surface soil temperature
- `soil_moisture_0_1cm` - Top 1cm soil moisture
- `uv_index_max` - Daily maximum UV index
- All standard weather variables

#### Weather Code Mapping ✅

According to [WMO codes](https://open-meteo.com/en/docs):
- 0: Clear sky ☀️
- 1-3: Clear to overcast 🌤️⛅☁️
- 45, 48: Fog 🌫️
- 51-55: Drizzle 🌦️
- 61-65: Rain 🌧️
- 71-75: Snow ❄️
- 95-99: Thunderstorm ⛈️

---

## 📊 API Comparison

| API | Status | Free Tier | Rate Limits | Documentation |
|-----|--------|-----------|-------------|--------------|
| **Infermedica Engine API** | ✅ Implemented | ✅ Yes | 1000/month | [Docs](https://developer.infermedica.com/docs/engine-api) |
| **Open-Meteo API** | ✅ Implemented | ✅ Yes | 10,000/day | [Docs](https://open-meteo.com/en/docs) |

---

## 🔧 Implementation Details

### Infermedica Engine API

**Endpoint Structure**:
```
POST /v3/search - Search symptoms
POST /v3/diagnosis - Analyze symptoms (stateless)
POST /v3/triage - Get triage recommendation
GET /v3/explain - Get condition explanation
```

**Key Implementation Points**:
1. ✅ Age format: `{ value: 30 }` (not just `30`)
2. ✅ Evidence format: `{ id: "s_1193", choice_id: "present" }`
3. ✅ Stateless: Must send all evidence in each request
4. ✅ Initial symptoms: Mark with `"source": "initial"`
5. ✅ Response handling: `question`, `conditions`, `should_stop`

### Open-Meteo API

**Endpoint Structure**:
```
GET /v1/forecast - Weather forecast (main endpoint)
```

**Key Implementation Points**:
1. ✅ No API key required (free tier)
2. ✅ Coordinates required: `latitude`, `longitude`
3. ✅ Timezone auto-detection: `timezone: "auto"`
4. ✅ Forecast days: 7 default, up to 16 days
5. ✅ Multiple weather models combined automatically

---

## ✅ Verification Checklist

### Infermedica API ✅
- [x] Age formatted as object `{ value: number }`
- [x] Evidence has `choice_id` (present/absent/unknown)
- [x] Initial symptoms marked with `"source": "initial"`
- [x] All evidence sent in each request (stateless)
- [x] Proper headers: App-Id, App-Key
- [x] Response handling: question, conditions, should_stop
- [x] Fallback system for offline use

### Open-Meteo API ✅
- [x] Correct endpoint: `/v1/forecast`
- [x] Required parameters: latitude, longitude
- [x] Optional parameters: current, hourly, daily
- [x] Timezone auto-detection
- [x] Forecast days parameter
- [x] Agricultural parameters (soil temp, moisture)
- [x] Weather code interpretation

---

## 🚀 Next Steps

### Optional Enhancements

1. **Interview-Id Header** (Infermedica):
   ```javascript
   'Interview-Id': `villagevault-${userId}-${Date.now()}`
   ```
   - Helps track interviews per user
   - Recommended but optional

2. **Short Triage Mode** (Infermedica):
   ```javascript
   extras: {
     "interview_mode": "short_triage"
   }
   ```
   - Faster interviews
   - Good for quick triage

3. **Weather Model Selection** (Open-Meteo):
   ```javascript
   models: "auto" // or specific model
   ```
   - Can select specific weather models
   - Auto combines best models (current default)

---

## 📚 Reference Links

- **Infermedica Engine API**: https://developer.infermedica.com/docs/engine-api/quickstart
- **Open-Meteo API**: https://open-meteo.com/en/docs
- **WMO Weather Codes**: https://open-meteo.com/en/docs (Weather variable documentation section)

---

**Last Updated**: Based on official API documentation as of 2025  
**Status**: ✅ Both APIs correctly implemented according to official documentation

