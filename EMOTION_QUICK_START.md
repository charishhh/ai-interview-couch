# 🎭 Emotion Detection - Quick Reference

## Installation (5 minutes)

```powershell
# Run automated installer
.\install-emotion-detection.ps1

# Or manual install
cd backend
pip install tensorflow keras opencv-python face-recognition dlib
```

## Start Services

```powershell
# Terminal 1: Backend
cd backend
uvicorn app.main:app --reload --port 8000

# Terminal 2: Frontend
npm run dev
```

## Test

1. Go to http://localhost:3000
2. Start Interview → Allow Camera
3. Click Microphone → See emotion detected!

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/emotion/analyze` | POST | Analyze single frame |
| `/api/emotion/timeline` | POST | Analyze multiple frames |
| `/api/emotion/health` | GET | Check service status |

## Emotions Detected

😠 angry · 🤢 disgust · 😨 fear · 😊 happy · 😢 sad · 😲 surprise · 😐 neutral

## Key Files

```
backend/
├── emotion_detection/
│   ├── emotion_detector.py    # Core CNN model
│   └── requirements.txt        # Dependencies
└── app/routes/
    └── emotion.py              # API endpoints

app/
├── api/analyze-emotion/
│   └── route.ts                # Next.js proxy
└── dashboard/
    ├── interview/[type]/
    │   └── page.tsx            # Video capture
    └── results/[id]/
        └── page.tsx            # Emotion charts
```

## Configuration

### Frame Capture Rate
```javascript
// app/dashboard/interview/[type]/page.tsx
setInterval(captureAndAnalyzeEmotion, 2000); // 2 seconds
```

### Model Weights
```
Place at: backend/emotion_detection/emotion_model.h5
```

## Troubleshooting

**Camera not working?**
- Check browser permissions
- Use HTTPS in production
- Try Chrome/Edge

**Backend not responding?**
```bash
# Check backend is running
curl http://localhost:8000/api/emotion/health
```

**Installation failed?**
```powershell
# Install Visual Studio Build Tools
# Then install dlib:
pip install dlib

# Or use conda:
conda install -c conda-forge dlib
```

## Documentation

- **Setup Guide**: `EMOTION_DETECTION_SETUP.md`
- **Full README**: `EMOTION_DETECTION_README.md`
- **Summary**: `EMOTION_INTEGRATION_SUMMARY.md`

## Status: ✅ READY TO USE!

All code complete, documented, and error-free.
