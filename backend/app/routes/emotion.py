"""
FastAPI routes for emotion detection
Integrates with the EmotionDetector service
"""

from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import List, Dict, Optional
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from emotion_detection.emotion_detector import get_emotion_detector

router = APIRouter(prefix="/emotion", tags=["emotion"])

# Initialize emotion detector (lazy loading)
emotion_detector = None

class EmotionAnalysisRequest(BaseModel):
    """Request model for base64 image emotion analysis"""
    image: str
    timestamp: Optional[float] = None

class EmotionAnalysisResponse(BaseModel):
    """Response model for emotion analysis"""
    success: bool
    faces: List[Dict]
    timestamp: Optional[float] = None
    message: Optional[str] = None

@router.post("/analyze", response_model=EmotionAnalysisResponse)
async def analyze_emotion(request: EmotionAnalysisRequest):
    """
    Analyze emotion from base64 encoded image
    
    Args:
        request: EmotionAnalysisRequest with base64 image
        
    Returns:
        EmotionAnalysisResponse with detected faces and emotions
    """
    global emotion_detector
    
    try:
        # Initialize detector on first use
        if emotion_detector is None:
            model_path = os.path.join(
                os.path.dirname(__file__),
                "..",
                "emotion_detection",
                "emotion_model.h5"
            )
            
            # Only load weights if model file exists
            if os.path.exists(model_path):
                emotion_detector = get_emotion_detector(model_path)
            else:
                print("Warning: Model weights not found. Using untrained model.")
                emotion_detector = get_emotion_detector()
        
        # Analyze image
        results = emotion_detector.analyze_base64_image(request.image)
        
        return EmotionAnalysisResponse(
            success=True,
            faces=results,
            timestamp=request.timestamp
        )
    
    except Exception as e:
        print(f"Error analyzing emotion: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to analyze emotion: {str(e)}"
        )

@router.get("/health")
async def health_check():
    """
    Health check endpoint for emotion detection service
    
    Returns:
        Status information
    """
    global emotion_detector
    
    return {
        "status": "healthy",
        "service": "emotion_detection",
        "model_loaded": emotion_detector is not None
    }

class EmotionTimelineRequest(BaseModel):
    """Request model for analyzing emotion timeline"""
    images: List[str]
    timestamps: List[float]

class EmotionTimelineResponse(BaseModel):
    """Response model for emotion timeline"""
    success: bool
    timeline: List[Dict]
    summary: Dict
    message: Optional[str] = None

@router.post("/timeline", response_model=EmotionTimelineResponse)
async def analyze_emotion_timeline(request: EmotionTimelineRequest):
    """
    Analyze emotions across multiple frames to create timeline
    
    Args:
        request: EmotionTimelineRequest with list of images and timestamps
        
    Returns:
        EmotionTimelineResponse with timeline data and summary
    """
    global emotion_detector
    
    try:
        # Initialize detector on first use
        if emotion_detector is None:
            emotion_detector = get_emotion_detector()
        
        timeline = []
        emotion_counts = {label: 0 for label in emotion_detector.emotion_labels}
        sentiment_scores = []
        
        # Analyze each frame
        for image, timestamp in zip(request.images, request.timestamps):
            results = emotion_detector.analyze_base64_image(image)
            
            # Get primary emotion from first detected face
            if results:
                primary_emotion = results[0]['emotion']
                confidence = results[0]['confidence']
                sentiment = emotion_detector.get_sentiment_score(primary_emotion)
                
                timeline.append({
                    'timestamp': timestamp,
                    'emotion': primary_emotion,
                    'confidence': confidence,
                    'sentiment': sentiment,
                    'face_count': len(results)
                })
                
                emotion_counts[primary_emotion] += 1
                sentiment_scores.append(sentiment)
        
        # Calculate summary statistics
        dominant_emotion = max(emotion_counts.items(), key=lambda x: x[1])[0]
        avg_sentiment = sum(sentiment_scores) / len(sentiment_scores) if sentiment_scores else 0.0
        
        summary = {
            'dominant_emotion': dominant_emotion,
            'emotion_distribution': emotion_counts,
            'average_sentiment': avg_sentiment,
            'total_frames': len(request.images),
            'frames_with_faces': len(timeline)
        }
        
        return EmotionTimelineResponse(
            success=True,
            timeline=timeline,
            summary=summary
        )
    
    except Exception as e:
        print(f"Error analyzing emotion timeline: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to analyze emotion timeline: {str(e)}"
        )
