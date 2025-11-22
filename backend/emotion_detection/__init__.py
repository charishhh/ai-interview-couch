"""
Emotion Detection Module
Real-time facial emotion detection using CNN
Based on: https://github.com/priya-dwivedi/face_and_emotion_detection
"""

from .emotion_detector import EmotionDetector, get_emotion_detector

__all__ = ['EmotionDetector', 'get_emotion_detector']
__version__ = '1.0.0'
