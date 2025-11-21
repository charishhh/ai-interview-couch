"""
File Storage Utilities
Functions for handling file uploads (audio, video, documents)
"""

import os
import uuid
import shutil
from pathlib import Path
from typing import Optional, Tuple
from fastapi import UploadFile, HTTPException, status
from datetime import datetime
from app.config import settings


def ensure_upload_directory() -> None:
    """
    Ensure upload directory exists. Create it if it doesn't.
    Creates subdirectories for different file types.
    """
    base_dir = Path(settings.UPLOAD_DIR)
    
    # Create main upload directory
    base_dir.mkdir(parents=True, exist_ok=True)
    
    # Create subdirectories
    (base_dir / "audio").mkdir(exist_ok=True)
    (base_dir / "video").mkdir(exist_ok=True)
    (base_dir / "documents").mkdir(exist_ok=True)
    (base_dir / "resumes").mkdir(exist_ok=True)
    
    print(f"✅ Upload directories ensured at: {base_dir.absolute()}")


def get_file_extension(filename: str) -> str:
    """
    Extract file extension from filename.
    
    Args:
        filename: Original filename
        
    Returns:
        str: File extension including dot (e.g., '.mp3')
        
    Example:
        ext = get_file_extension("recording.mp3")  # Returns: ".mp3"
    """
    return Path(filename).suffix.lower()


def validate_file_size(file: UploadFile) -> None:
    """
    Validate file size against maximum allowed size.
    
    Args:
        file: Uploaded file
        
    Raises:
        HTTPException: If file size exceeds limit
    """
    # Get file size (file.size might not be available, so we read and seek)
    file.file.seek(0, 2)  # Move to end of file
    file_size = file.file.tell()
    file.file.seek(0)  # Reset to beginning
    
    if file_size > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size exceeds maximum allowed size of {settings.MAX_FILE_SIZE / (1024 * 1024):.2f} MB"
        )


def validate_file_extension(filename: str, allowed_extensions: list) -> None:
    """
    Validate file extension against allowed extensions.
    
    Args:
        filename: Original filename
        allowed_extensions: List of allowed extensions (e.g., ['.mp3', '.wav'])
        
    Raises:
        HTTPException: If extension is not allowed
    """
    extension = get_file_extension(filename)
    
    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"File type '{extension}' not allowed. Allowed types: {', '.join(allowed_extensions)}"
        )


def generate_unique_filename(original_filename: str) -> str:
    """
    Generate a unique filename using UUID while preserving extension.
    
    Args:
        original_filename: Original filename
        
    Returns:
        str: Unique filename
        
    Example:
        unique_name = generate_unique_filename("recording.mp3")
        # Returns: "20231115_a3b4c5d6-e7f8-9012-3456-789abcdef012.mp3"
    """
    extension = get_file_extension(original_filename)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_id = str(uuid.uuid4())
    return f"{timestamp}_{unique_id}{extension}"


async def save_audio_file(file: UploadFile, user_id: int) -> Tuple[str, int]:
    """
    Save an uploaded audio file.
    
    Args:
        file: Uploaded audio file
        user_id: ID of the user uploading the file
        
    Returns:
        Tuple[str, int]: (file_path, file_size)
        
    Raises:
        HTTPException: If validation fails or save fails
        
    Example:
        file_path, file_size = await save_audio_file(audio_file, user_id=1)
    """
    # Validate file
    validate_file_extension(file.filename, settings.allowed_audio_exts)
    validate_file_size(file)
    
    # Generate unique filename
    unique_filename = generate_unique_filename(file.filename)
    
    # Create user subdirectory
    user_audio_dir = Path(settings.UPLOAD_DIR) / "audio" / str(user_id)
    user_audio_dir.mkdir(parents=True, exist_ok=True)
    
    # Full file path
    file_path = user_audio_dir / unique_filename
    
    try:
        # Save file
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Get file size
        file_size = file_path.stat().st_size
        
        # Return relative path (from upload directory)
        relative_path = str(file_path.relative_to(settings.UPLOAD_DIR))
        
        return relative_path, file_size
        
    except Exception as e:
        # Clean up if save failed
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save audio file: {str(e)}"
        )


async def save_video_file(file: UploadFile, user_id: int) -> Tuple[str, int]:
    """
    Save an uploaded video file.
    
    Args:
        file: Uploaded video file
        user_id: ID of the user uploading the file
        
    Returns:
        Tuple[str, int]: (file_path, file_size)
        
    Raises:
        HTTPException: If validation fails or save fails
    """
    # Validate file
    validate_file_extension(file.filename, settings.allowed_video_exts)
    validate_file_size(file)
    
    # Generate unique filename
    unique_filename = generate_unique_filename(file.filename)
    
    # Create user subdirectory
    user_video_dir = Path(settings.UPLOAD_DIR) / "video" / str(user_id)
    user_video_dir.mkdir(parents=True, exist_ok=True)
    
    # Full file path
    file_path = user_video_dir / unique_filename
    
    try:
        # Save file
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Get file size
        file_size = file_path.stat().st_size
        
        # Return relative path
        relative_path = str(file_path.relative_to(settings.UPLOAD_DIR))
        
        return relative_path, file_size
        
    except Exception as e:
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save video file: {str(e)}"
        )


async def save_resume_file(file: UploadFile, user_id: int) -> Tuple[str, int]:
    """
    Save an uploaded resume/document file.
    
    Args:
        file: Uploaded document file
        user_id: ID of the user uploading the file
        
    Returns:
        Tuple[str, int]: (file_path, file_size)
        
    Raises:
        HTTPException: If validation fails or save fails
    """
    # Validate file
    validate_file_extension(file.filename, settings.allowed_document_exts)
    validate_file_size(file)
    
    # Generate unique filename
    unique_filename = generate_unique_filename(file.filename)
    
    # Create user subdirectory
    user_resume_dir = Path(settings.UPLOAD_DIR) / "resumes" / str(user_id)
    user_resume_dir.mkdir(parents=True, exist_ok=True)
    
    # Full file path
    file_path = user_resume_dir / unique_filename
    
    try:
        # Save file
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Get file size
        file_size = file_path.stat().st_size
        
        # Return relative path
        relative_path = str(file_path.relative_to(settings.UPLOAD_DIR))
        
        return relative_path, file_size
        
    except Exception as e:
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save resume file: {str(e)}"
        )


def delete_file(file_path: str) -> bool:
    """
    Delete a file from storage.
    
    Args:
        file_path: Relative path to file (from upload directory)
        
    Returns:
        bool: True if deleted successfully, False otherwise
        
    Example:
        success = delete_file("audio/1/recording.mp3")
    """
    try:
        full_path = Path(settings.UPLOAD_DIR) / file_path
        if full_path.exists():
            full_path.unlink()
            return True
        return False
    except Exception as e:
        print(f"Error deleting file {file_path}: {str(e)}")
        return False


def get_file_path(relative_path: str) -> Path:
    """
    Get full file path from relative path.
    
    Args:
        relative_path: Relative path from upload directory
        
    Returns:
        Path: Full file path
        
    Example:
        full_path = get_file_path("audio/1/recording.mp3")
    """
    return Path(settings.UPLOAD_DIR) / relative_path


def file_exists(relative_path: str) -> bool:
    """
    Check if a file exists.
    
    Args:
        relative_path: Relative path from upload directory
        
    Returns:
        bool: True if file exists, False otherwise
    """
    return get_file_path(relative_path).exists()
