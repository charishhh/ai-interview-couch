# Emotion Detection - Quick Install Script for Windows
# Run this script to install all emotion detection dependencies

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Emotion Detection Setup" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if Python is installed
Write-Host "Checking Python installation..." -ForegroundColor Yellow
$pythonVersion = python --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Python is not installed!" -ForegroundColor Red
    Write-Host "Please install Python 3.8+ from https://www.python.org/downloads/" -ForegroundColor Red
    exit 1
}
Write-Host "Found: $pythonVersion" -ForegroundColor Green
Write-Host ""

# Check if pip is available
Write-Host "Checking pip installation..." -ForegroundColor Yellow
$pipVersion = pip --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: pip is not installed!" -ForegroundColor Red
    exit 1
}
Write-Host "Found: $pipVersion" -ForegroundColor Green
Write-Host ""

# Navigate to backend directory
$backendPath = "backend"
if (-Not (Test-Path $backendPath)) {
    Write-Host "ERROR: Backend directory not found!" -ForegroundColor Red
    Write-Host "Please run this script from the project root directory." -ForegroundColor Red
    exit 1
}

Write-Host "Installing emotion detection dependencies..." -ForegroundColor Yellow
Write-Host "This may take 5-10 minutes. Please be patient." -ForegroundColor Yellow
Write-Host ""

# Install dependencies
try {
    # Install TensorFlow
    Write-Host "[1/6] Installing TensorFlow..." -ForegroundColor Cyan
    pip install tensorflow>=2.13.0 --quiet
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ TensorFlow installed successfully" -ForegroundColor Green
    } else {
        throw "TensorFlow installation failed"
    }
    
    # Install Keras
    Write-Host "[2/6] Installing Keras..." -ForegroundColor Cyan
    pip install keras>=2.13.0 --quiet
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Keras installed successfully" -ForegroundColor Green
    } else {
        throw "Keras installation failed"
    }
    
    # Install OpenCV
    Write-Host "[3/6] Installing OpenCV..." -ForegroundColor Cyan
    pip install opencv-python>=4.8.0 opencv-contrib-python>=4.8.0 --quiet
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ OpenCV installed successfully" -ForegroundColor Green
    } else {
        throw "OpenCV installation failed"
    }
    
    # Install face_recognition and dlib
    Write-Host "[4/6] Installing face_recognition and dlib..." -ForegroundColor Cyan
    Write-Host "    Note: This may require Visual Studio Build Tools on Windows" -ForegroundColor Yellow
    pip install face-recognition>=1.3.0 dlib>=19.24.0 --quiet
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ face_recognition installed successfully" -ForegroundColor Green
    } else {
        Write-Host "⚠ face_recognition installation failed" -ForegroundColor Yellow
        Write-Host "    You may need to install dlib separately:" -ForegroundColor Yellow
        Write-Host "    - Install Visual Studio Build Tools" -ForegroundColor Yellow
        Write-Host "    - Or use: conda install -c conda-forge dlib" -ForegroundColor Yellow
    }
    
    # Install image processing libraries
    Write-Host "[5/6] Installing image processing libraries..." -ForegroundColor Cyan
    pip install Pillow>=10.0.0 scikit-image>=0.21.0 --quiet
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Image processing libraries installed successfully" -ForegroundColor Green
    } else {
        throw "Image processing libraries installation failed"
    }
    
    # Install data processing libraries
    Write-Host "[6/6] Installing data processing libraries..." -ForegroundColor Cyan
    pip install numpy>=1.24.0 scipy>=1.11.0 scikit-learn>=1.3.0 matplotlib>=3.7.0 --quiet
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Data processing libraries installed successfully" -ForegroundColor Green
    } else {
        throw "Data processing libraries installation failed"
    }
    
    Write-Host ""
    Write-Host "==================================" -ForegroundColor Green
    Write-Host "Installation Complete!" -ForegroundColor Green
    Write-Host "==================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Start the backend server:" -ForegroundColor White
    Write-Host "   cd backend" -ForegroundColor Gray
    Write-Host "   uvicorn app.main:app --reload --port 8000" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Test emotion detection API:" -ForegroundColor White
    Write-Host "   http://localhost:8000/api/emotion/health" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. (Optional) Download pre-trained model weights:" -ForegroundColor White
    Write-Host "   Place emotion_model.h5 in backend/emotion_detection/" -ForegroundColor Gray
    Write-Host ""
    Write-Host "For detailed setup instructions, see EMOTION_DETECTION_SETUP.md" -ForegroundColor Yellow
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "==================================" -ForegroundColor Red
    Write-Host "Installation Failed!" -ForegroundColor Red
    Write-Host "==================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Ensure Python 3.8+ is installed" -ForegroundColor White
    Write-Host "2. Update pip: python -m pip install --upgrade pip" -ForegroundColor White
    Write-Host "3. For dlib issues on Windows:" -ForegroundColor White
    Write-Host "   - Install Visual Studio Build Tools" -ForegroundColor White
    Write-Host "   - Or use Anaconda: conda install -c conda-forge dlib" -ForegroundColor White
    Write-Host ""
    Write-Host "For more help, see EMOTION_DETECTION_SETUP.md" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# Verify installation
Write-Host "Verifying installation..." -ForegroundColor Yellow
Write-Host ""

$verifyScript = @"
import sys
try:
    import tensorflow as tf
    print(f'✓ TensorFlow {tf.__version__}')
except ImportError:
    print('✗ TensorFlow not found')
    sys.exit(1)

try:
    import keras
    print(f'✓ Keras {keras.__version__}')
except ImportError:
    print('✗ Keras not found')
    sys.exit(1)

try:
    import cv2
    print(f'✓ OpenCV {cv2.__version__}')
except ImportError:
    print('✗ OpenCV not found')
    sys.exit(1)

try:
    import face_recognition
    print('✓ face_recognition installed')
except ImportError:
    print('⚠ face_recognition not found (optional)')

try:
    import numpy as np
    print(f'✓ NumPy {np.__version__}')
except ImportError:
    print('✗ NumPy not found')
    sys.exit(1)

try:
    import PIL
    print(f'✓ Pillow {PIL.__version__}')
except ImportError:
    print('✗ Pillow not found')
    sys.exit(1)

print('\nAll core dependencies are installed!')
"@

python -c $verifyScript

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Verification successful!" -ForegroundColor Green
    Write-Host "You're ready to use emotion detection!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "⚠ Some dependencies are missing" -ForegroundColor Yellow
    Write-Host "Please review the errors above and install missing packages" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
