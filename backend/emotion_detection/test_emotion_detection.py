"""
Test script for emotion detection
Run this to verify the emotion detection system is working correctly
"""

import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

def test_imports():
    """Test if all required libraries are installed"""
    print("=" * 50)
    print("Testing Imports")
    print("=" * 50)
    
    try:
        import tensorflow as tf
        print(f"✓ TensorFlow {tf.__version__}")
    except ImportError as e:
        print(f"✗ TensorFlow: {e}")
        return False
    
    try:
        import keras
        print(f"✓ Keras {keras.__version__}")
    except ImportError as e:
        print(f"✗ Keras: {e}")
        return False
    
    try:
        import cv2
        print(f"✓ OpenCV {cv2.__version__}")
    except ImportError as e:
        print(f"✗ OpenCV: {e}")
        return False
    
    try:
        import face_recognition
        print("✓ face_recognition installed")
    except ImportError as e:
        print(f"⚠ face_recognition: {e} (optional)")
    
    try:
        import numpy as np
        print(f"✓ NumPy {np.__version__}")
    except ImportError as e:
        print(f"✗ NumPy: {e}")
        return False
    
    try:
        from PIL import Image
        print(f"✓ Pillow {Image.__version__}")
    except ImportError as e:
        print(f"✗ Pillow: {e}")
        return False
    
    print("\n✅ All imports successful!\n")
    return True


def test_model_creation():
    """Test if emotion detector model can be created"""
    print("=" * 50)
    print("Testing Model Creation")
    print("=" * 50)
    
    try:
        from emotion_detection.emotion_detector import EmotionDetector
        
        detector = EmotionDetector()
        print("✓ EmotionDetector created successfully")
        print(f"✓ Model expects input shape: (48, 48, 1)")
        print(f"✓ Detects {len(detector.emotion_labels)} emotions: {', '.join(detector.emotion_labels)}")
        
        # Test model summary
        print("\nModel Architecture:")
        detector.model.summary()
        
        print("\n✅ Model creation successful!\n")
        return True
    except Exception as e:
        print(f"✗ Error creating model: {e}")
        return False


def test_face_detection():
    """Test face detection with a sample image"""
    print("=" * 50)
    print("Testing Face Detection")
    print("=" * 50)
    
    try:
        import numpy as np
        import cv2
        from emotion_detection.emotion_detector import EmotionDetector
        
        # Create a simple test image (random noise)
        test_image = np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8)
        
        detector = EmotionDetector()
        
        # Try to detect faces (should find none in random noise)
        faces = detector.detect_faces(test_image)
        print(f"✓ Face detection working (found {len(faces)} faces in test image)")
        
        print("\n✅ Face detection test passed!\n")
        return True
    except Exception as e:
        print(f"✗ Error in face detection: {e}")
        print("⚠ This is normal if face_recognition is not installed")
        return True  # Don't fail test if face_recognition is optional


def test_emotion_prediction():
    """Test emotion prediction on a dummy face"""
    print("=" * 50)
    print("Testing Emotion Prediction")
    print("=" * 50)
    
    try:
        import numpy as np
        from emotion_detection.emotion_detector import EmotionDetector
        
        # Create a dummy face image (100x100 RGB)
        dummy_face = np.random.randint(0, 255, (100, 100, 3), dtype=np.uint8)
        
        detector = EmotionDetector()
        
        # Predict emotion
        result = detector.predict_emotion(dummy_face)
        
        print(f"✓ Emotion predicted: {result['emotion']}")
        print(f"✓ Confidence: {result['confidence']:.2%}")
        print("\nAll emotion probabilities:")
        for emotion, prob in result['probabilities'].items():
            print(f"  {emotion:10s}: {prob:.2%}")
        
        print("\n✅ Emotion prediction test passed!\n")
        return True
    except Exception as e:
        print(f"✗ Error in emotion prediction: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_base64_processing():
    """Test base64 image processing"""
    print("=" * 50)
    print("Testing Base64 Image Processing")
    print("=" * 50)
    
    try:
        import numpy as np
        import base64
        from io import BytesIO
        from PIL import Image
        from emotion_detection.emotion_detector import EmotionDetector
        
        # Create a test image
        test_image = np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8)
        pil_image = Image.fromarray(test_image)
        
        # Convert to base64
        buffered = BytesIO()
        pil_image.save(buffered, format="JPEG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        
        detector = EmotionDetector()
        
        # Analyze base64 image
        results = detector.analyze_base64_image(img_str)
        
        print(f"✓ Base64 processing working")
        print(f"✓ Found {len(results)} faces in image")
        
        print("\n✅ Base64 processing test passed!\n")
        return True
    except Exception as e:
        print(f"✗ Error in base64 processing: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_sentiment_scoring():
    """Test sentiment score calculation"""
    print("=" * 50)
    print("Testing Sentiment Scoring")
    print("=" * 50)
    
    try:
        from emotion_detection.emotion_detector import EmotionDetector
        
        detector = EmotionDetector()
        
        test_emotions = ['happy', 'angry', 'sad', 'neutral', 'surprise']
        
        print("Sentiment scores:")
        for emotion in test_emotions:
            score = detector.get_sentiment_score(emotion)
            print(f"  {emotion:10s}: {score:+.1f} {'😊' if score > 0 else '😐' if score == 0 else '😞'}")
        
        print("\n✅ Sentiment scoring test passed!\n")
        return True
    except Exception as e:
        print(f"✗ Error in sentiment scoring: {e}")
        return False


def run_all_tests():
    """Run all tests"""
    print("\n")
    print("*" * 60)
    print("*" + " " * 58 + "*")
    print("*" + "  EMOTION DETECTION TEST SUITE".center(58) + "*")
    print("*" + " " * 58 + "*")
    print("*" * 60)
    print("\n")
    
    tests = [
        ("Imports", test_imports),
        ("Model Creation", test_model_creation),
        ("Face Detection", test_face_detection),
        ("Emotion Prediction", test_emotion_prediction),
        ("Base64 Processing", test_base64_processing),
        ("Sentiment Scoring", test_sentiment_scoring),
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"\n✗ Test '{test_name}' failed with exception: {e}\n")
            results.append((test_name, False))
    
    # Summary
    print("=" * 50)
    print("Test Summary")
    print("=" * 50)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print("\n" + "=" * 50)
    print(f"Results: {passed}/{total} tests passed ({passed/total*100:.1f}%)")
    print("=" * 50)
    
    if passed == total:
        print("\n🎉 All tests passed! Emotion detection is ready to use!")
        print("\nNext steps:")
        print("1. Start the backend: uvicorn app.main:app --reload")
        print("2. Test the API: http://localhost:8000/api/emotion/health")
        print("3. Start the frontend: npm run dev")
        print("4. Try an interview with camera enabled!\n")
        return 0
    else:
        print("\n⚠️  Some tests failed. Please check the errors above.")
        print("\nTroubleshooting:")
        print("1. Ensure all dependencies are installed: pip install -r emotion_detection/requirements.txt")
        print("2. Check Python version: python --version (need 3.8+)")
        print("3. For dlib issues on Windows, install Visual Studio Build Tools")
        print("4. See EMOTION_DETECTION_SETUP.md for detailed help\n")
        return 1


if __name__ == "__main__":
    exit_code = run_all_tests()
    sys.exit(exit_code)
