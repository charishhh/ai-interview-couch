"""
Emotion Detection Service - Based on face_and_emotion_detection repo
Detects 7 emotions: angry, disgust, fear, happy, sad, surprise, neutral
"""

import cv2
import numpy as np
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout, Flatten, Conv2D, MaxPooling2D
from tensorflow.keras.preprocessing.image import img_to_array
import face_recognition
from typing import Dict, List, Optional
import base64
from io import BytesIO
from PIL import Image

class EmotionDetector:
    def __init__(self, model_path: Optional[str] = None):
        """
        Initialize emotion detector with CNN model
        
        Args:
            model_path: Path to pre-trained model weights (optional)
        """
        self.emotion_labels = ['angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral']
        self.model = self._build_model()
        
        if model_path:
            try:
                self.model.load_weights(model_path)
                print(f"Loaded model weights from {model_path}")
            except Exception as e:
                print(f"Warning: Could not load model weights: {e}")
                print("Using randomly initialized model. Train the model for better results.")
    
    def _build_model(self) -> Sequential:
        """
        Build CNN architecture for emotion detection
        Architecture based on the face_and_emotion_detection repository
        
        Returns:
            Compiled Keras Sequential model
        """
        model = Sequential()
        
        # First convolutional layer
        model.add(Conv2D(32, kernel_size=(3, 3), activation='relu', input_shape=(48, 48, 1)))
        model.add(Conv2D(64, kernel_size=(3, 3), activation='relu'))
        model.add(MaxPooling2D(pool_size=(2, 2)))
        model.add(Dropout(0.25))
        
        # Second convolutional layer
        model.add(Conv2D(128, kernel_size=(3, 3), activation='relu'))
        model.add(MaxPooling2D(pool_size=(2, 2)))
        model.add(Conv2D(128, kernel_size=(3, 3), activation='relu'))
        model.add(MaxPooling2D(pool_size=(2, 2)))
        model.add(Dropout(0.25))
        
        # Fully connected layers
        model.add(Flatten())
        model.add(Dense(1024, activation='relu'))
        model.add(Dropout(0.5))
        model.add(Dense(7, activation='softmax'))
        
        model.compile(
            loss='categorical_crossentropy',
            optimizer='adam',
            metrics=['accuracy']
        )
        
        return model
    
    def detect_faces(self, frame: np.ndarray) -> List[tuple]:
        """
        Detect faces in frame using face_recognition library
        
        Args:
            frame: Input image as numpy array (BGR format from OpenCV)
            
        Returns:
            List of face locations as (top, right, bottom, left) tuples
        """
        # Convert BGR to RGB
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Detect faces
        face_locations = face_recognition.face_locations(rgb_frame)
        
        return face_locations
    
    def preprocess_face(self, face_roi: np.ndarray) -> np.ndarray:
        """
        Preprocess face ROI for emotion detection
        
        Args:
            face_roi: Face region of interest as numpy array
            
        Returns:
            Preprocessed face ready for model input
        """
        # Convert to grayscale
        gray_face = cv2.cvtColor(face_roi, cv2.COLOR_BGR2GRAY)
        
        # Resize to 48x48 (model input size)
        resized_face = cv2.resize(gray_face, (48, 48))
        
        # Normalize pixel values
        normalized_face = resized_face / 255.0
        
        # Reshape for model input (1, 48, 48, 1)
        preprocessed = normalized_face.reshape(1, 48, 48, 1)
        
        return preprocessed
    
    def predict_emotion(self, face_roi: np.ndarray) -> Dict[str, any]:
        """
        Predict emotion from face region
        
        Args:
            face_roi: Face region of interest as numpy array
            
        Returns:
            Dictionary containing emotion label, confidence, and all probabilities
        """
        # Preprocess face
        preprocessed_face = self.preprocess_face(face_roi)
        
        # Predict emotion probabilities
        emotion_probabilities = self.model.predict(preprocessed_face, verbose=0)[0]
        
        # Get dominant emotion
        max_index = np.argmax(emotion_probabilities)
        emotion_label = self.emotion_labels[max_index]
        confidence = float(emotion_probabilities[max_index])
        
        # Create probability dictionary
        emotion_probs = {
            label: float(prob) 
            for label, prob in zip(self.emotion_labels, emotion_probabilities)
        }
        
        return {
            'emotion': emotion_label,
            'confidence': confidence,
            'probabilities': emotion_probs
        }
    
    def analyze_frame(self, frame: np.ndarray) -> List[Dict[str, any]]:
        """
        Analyze all faces in a frame for emotions
        
        Args:
            frame: Input image as numpy array
            
        Returns:
            List of dictionaries containing face location and emotion data
        """
        results = []
        
        # Detect faces
        face_locations = self.detect_faces(frame)
        
        # Analyze each face
        for face_location in face_locations:
            top, right, bottom, left = face_location
            
            # Extract face ROI
            face_roi = frame[top:bottom, left:right]
            
            # Skip if face is too small
            if face_roi.shape[0] < 20 or face_roi.shape[1] < 20:
                continue
            
            # Predict emotion
            emotion_data = self.predict_emotion(face_roi)
            
            results.append({
                'location': {
                    'top': top,
                    'right': right,
                    'bottom': bottom,
                    'left': left
                },
                **emotion_data
            })
        
        return results
    
    def analyze_base64_image(self, base64_image: str) -> List[Dict[str, any]]:
        """
        Analyze emotion from base64 encoded image
        
        Args:
            base64_image: Base64 encoded image string
            
        Returns:
            List of emotion analysis results
        """
        # Remove data URL prefix if present
        if ',' in base64_image:
            base64_image = base64_image.split(',')[1]
        
        # Decode base64 to image
        image_data = base64.b64decode(base64_image)
        image = Image.open(BytesIO(image_data))
        
        # Convert to numpy array
        frame = np.array(image)
        
        # Convert RGB to BGR if needed (OpenCV format)
        if len(frame.shape) == 3 and frame.shape[2] == 3:
            frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
        
        # Analyze frame
        return self.analyze_frame(frame)
    
    def get_sentiment_score(self, emotion: str) -> float:
        """
        Convert emotion to sentiment score (-1 to 1)
        
        Args:
            emotion: Emotion label
            
        Returns:
            Sentiment score where negative is bad, positive is good
        """
        sentiment_mapping = {
            'happy': 1.0,
            'surprise': 0.5,
            'neutral': 0.0,
            'fear': -0.3,
            'sad': -0.6,
            'angry': -0.8,
            'disgust': -0.9
        }
        
        return sentiment_mapping.get(emotion, 0.0)


# Singleton instance
_emotion_detector = None

def get_emotion_detector(model_path: Optional[str] = None) -> EmotionDetector:
    """
    Get singleton instance of emotion detector
    
    Args:
        model_path: Path to model weights (only used on first call)
        
    Returns:
        EmotionDetector instance
    """
    global _emotion_detector
    
    if _emotion_detector is None:
        _emotion_detector = EmotionDetector(model_path)
    
    return _emotion_detector
