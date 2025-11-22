# Emotion Detection Setup Guide

## Overview
This project integrates real-time facial emotion detection during interviews using a CNN-based model inspired by the [face_and_emotion_detection](https://github.com/priya-dwivedi/face_and_emotion_detection) repository.

## Features
- **Real-time emotion detection** during video interviews
- **7 emotions detected**: angry, disgust, fear, happy, sad, surprise, neutral
- **Sentiment analysis** with timeline visualization
- **Face detection** using face_recognition library
- **CNN model** for emotion classification

## Installation

### 1. Install Python Dependencies

Navigate to the backend directory:
```powershell
cd backend
```

Install emotion detection requirements:
```powershell
pip install -r emotion_detection/requirements.txt
```

**Key Dependencies:**
- TensorFlow 2.13+ (Deep learning framework)
- Keras 2.13+ (Neural network API)
- OpenCV 4.8+ (Computer vision)
- face_recognition 1.3+ (Face detection)
- dlib 19.24+ (Face recognition backend)

### 2. Download Pre-trained Model (Optional)

The system will work with a randomly initialized model, but for better results, you should train or download a pre-trained emotion detection model.

**Option A: Train Your Own Model**
```python
# Use the training notebook from the original repo
# https://github.com/priya-dwivedi/face_and_emotion_detection/blob/master/src/EmotionDetector_v2.ipynb
```

**Option B: Use Pre-trained Weights**
Place your trained model weights at:
```
backend/emotion_detection/emotion_model.h5
```

### 3. Environment Variables

Add to your `.env.local` (frontend) or `.env` (backend):
```env
# Backend URL for emotion detection
BACKEND_URL=http://localhost:8000
```

### 4. Start the Backend Server

```powershell
cd backend
uvicorn app.main:app --reload --port 8000
```

The emotion detection API will be available at:
- Analyze single frame: `POST http://localhost:8000/api/emotion/analyze`
- Analyze timeline: `POST http://localhost:8000/api/emotion/timeline`
- Health check: `GET http://localhost:8000/api/emotion/health`

## Usage

### During Interview

1. **Start Interview**: Navigate to Dashboard → Start Interview
2. **Allow Camera Access**: Browser will prompt for camera permission
3. **Start Recording**: Click the microphone button
4. **Automatic Detection**: System captures frames every 2 seconds and analyzes emotions
5. **View Live Feedback**: Current emotion displays on the video feed
6. **Complete Interview**: Emotion timeline is saved with results

### View Results

Navigate to Results page to see:
- **Emotion Timeline Chart**: Real-time sentiment and confidence scores
- **Dominant Emotion**: Most frequently detected emotion
- **Average Sentiment**: Overall emotional tone (-1 to 1 scale)
- **Confidence Scores**: Model confidence over time

## API Endpoints

### POST /api/emotion/analyze
Analyze a single frame for emotions.

**Request:**
```json
{
  "image": "base64_encoded_image_string",
  "timestamp": 10.5
}
```

**Response:**
```json
{
  "success": true,
  "faces": [
    {
      "location": {"top": 100, "right": 300, "bottom": 250, "left": 150},
      "emotion": "happy",
      "confidence": 0.89,
      "probabilities": {
        "angry": 0.02,
        "disgust": 0.01,
        "fear": 0.03,
        "happy": 0.89,
        "sad": 0.01,
        "surprise": 0.02,
        "neutral": 0.02
      }
    }
  ],
  "timestamp": 10.5
}
```

### POST /api/emotion/timeline
Analyze multiple frames to create emotion timeline.

**Request:**
```json
{
  "images": ["base64_img1", "base64_img2", "..."],
  "timestamps": [0, 2, 4, 6, 8]
}
```

**Response:**
```json
{
  "success": true,
  "timeline": [
    {
      "timestamp": 0,
      "emotion": "neutral",
      "confidence": 0.75,
      "sentiment": 0.0,
      "face_count": 1
    }
  ],
  "summary": {
    "dominant_emotion": "happy",
    "emotion_distribution": {
      "happy": 15,
      "neutral": 8,
      "surprise": 2
    },
    "average_sentiment": 0.65,
    "total_frames": 25,
    "frames_with_faces": 23
  }
}
```

## Architecture

### CNN Model Architecture
```
Input (48x48x1 grayscale image)
↓
Conv2D(32) + Conv2D(64) + MaxPooling + Dropout(0.25)
↓
Conv2D(128) + MaxPooling + Conv2D(128) + MaxPooling + Dropout(0.25)
↓
Flatten + Dense(1024) + Dropout(0.5)
↓
Dense(7, softmax) - Output (7 emotions)
```

### Pipeline Flow
```
Interview Page (Next.js)
  ↓ [Webcam captures video]
Video Frame (every 2 seconds)
  ↓ [Canvas extraction]
Base64 Image
  ↓ [POST /api/analyze-emotion]
Next.js API Route
  ↓ [Proxy to backend]
FastAPI Backend (/api/emotion/analyze)
  ↓ [Face detection]
face_recognition library
  ↓ [Face preprocessing]
OpenCV (grayscale, resize to 48x48)
  ↓ [Emotion prediction]
CNN Model (TensorFlow/Keras)
  ↓ [Return results]
Emotion + Confidence + Probabilities
  ↓ [Store in state]
Interview Page (display + timeline)
```

## Troubleshooting

### Camera Not Working
- **Check browser permissions**: Ensure camera access is allowed
- **HTTPS requirement**: Camera API requires HTTPS in production
- **Browser compatibility**: Use Chrome, Firefox, or Edge

### Backend Connection Failed
- **Verify backend is running**: Check `http://localhost:8000/docs`
- **CORS settings**: Ensure frontend URL is in backend CORS origins
- **Environment variables**: Verify `BACKEND_URL` is set correctly

### Model Performance Issues
- **Low accuracy**: Train model on FER2013 or AffectNet dataset
- **Slow inference**: Use GPU acceleration with `tensorflow-gpu`
- **Memory errors**: Reduce batch size or image resolution

### dlib Installation Issues (Windows)
```powershell
# Install Visual Studio Build Tools
# Download from: https://visualstudio.microsoft.com/downloads/

# Install CMake
choco install cmake

# Install dlib
pip install dlib
```

### face_recognition Installation Issues
```powershell
# If pip install fails, use conda:
conda install -c conda-forge dlib
pip install face_recognition
```

## Performance Optimization

### 1. Reduce Frame Capture Rate
```javascript
// Change interval from 2 seconds to 3 or 5 seconds
emotionIntervalRef.current = setInterval(() => {
  captureAndAnalyzeEmotion();
}, 5000); // 5 seconds instead of 2
```

### 2. Use GPU Acceleration
```python
# Install TensorFlow with GPU support
pip install tensorflow-gpu
```

### 3. Model Quantization
```python
# Convert model to TFLite for faster inference
converter = tf.lite.TFLiteConverter.from_keras_model(model)
tflite_model = converter.convert()
```

### 4. Batch Processing
```python
# Process multiple frames in batch
preprocessed_faces = np.array([preprocess_face(face) for face in faces])
predictions = model.predict(preprocessed_faces, batch_size=8)
```

## Training Your Own Model

### Dataset
Use FER2013 dataset (35,887 images):
- Download: https://www.kaggle.com/datasets/msambare/fer2013
- 7 emotion classes
- 48x48 grayscale images

### Training Script
```python
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# Data augmentation
datagen = ImageDataGenerator(
    rotation_range=20,
    width_shift_range=0.2,
    height_shift_range=0.2,
    horizontal_flip=True,
    validation_split=0.2
)

# Train model
model.fit(
    datagen.flow(X_train, y_train, batch_size=64),
    validation_data=(X_val, y_val),
    epochs=50,
    callbacks=[early_stopping, checkpoint]
)

# Save weights
model.save('emotion_model.h5')
```

## Credits

This implementation is inspired by:
- **Repository**: [face_and_emotion_detection](https://github.com/priya-dwivedi/face_and_emotion_detection)
- **Author**: Priya Dwivedi
- **License**: MIT

## Next Steps

1. **Improve Model**: Train on larger datasets (AffectNet, RAF-DB)
2. **Add More Features**: Gaze tracking, micro-expressions, head pose
3. **Real-time Feedback**: Alert candidates about negative emotions
4. **Analytics Dashboard**: Aggregate emotion data across interviews
5. **Multi-face Support**: Analyze group interviews
6. **Video Recording**: Save interview videos for review

## Support

For issues or questions:
1. Check backend logs: `uvicorn` terminal output
2. Check browser console: F12 → Console tab
3. Test emotion API: `http://localhost:8000/api/emotion/health`
4. Verify model loaded: Check "model_loaded" in health response
