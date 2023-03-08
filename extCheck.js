// image
exports.isImageExt = (fileName) => {
  fileName = fileName.substring(fileName.lastIndexOf('.'))
  if (fileName.toUpperCase().match(/\.(jpg)$/i)) {
    return true
  } if (fileName.toUpperCase().match(/\.(jpeg)$/i)) {
    return true
  } if (fileName.toUpperCase().match(/\.(png)$/i)) {
    return true
  } if (fileName.toUpperCase().match(/\.(gif)$/i)) {
    return true
  } if (fileName.toUpperCase().match(/\.(JPG)$/i)) {
    return true
  } if (fileName.toUpperCase().match(/\.(JPEG)$/i)) {
    return true
  } if (fileName.toUpperCase().match(/\.(PNG)$/i)) {
    return true
  } if (fileName.toUpperCase().match(/\.(GIF)$/i)) {
    return true
  }
  return false
}

// video
exports.isVideoExt = (fileName) => {
  fileName = fileName.substring(fileName.lastIndexOf('.'))
  if (fileName.toUpperCase().match(/\.(mp4)$/i)) {
    return true
  }
  if (fileName.toUpperCase().match(/\.(avi)$/i)) {
    return true
  }
  if (fileName.toUpperCase().match(/\.(fiv)$/i)) {
    return true
  }
  if (fileName.toUpperCase().match(/\.(mov)$/i)) {
    return true
  }
  if (fileName.toUpperCase().match(/\.(wmv)$/i)) {
    return true
  }
  if (fileName.toUpperCase().match(/\.(MP4)$/i)) {
    return true
  }
  if (fileName.toUpperCase().match(/\.(AVI)$/i)) {
    return true
  }
  if (fileName.toUpperCase().match(/\.(FIV)$/i)) {
    return true
  }
  if (fileName.toUpperCase().match(/\.(MOV)$/i)) {
    return true
  }
  if (fileName.toUpperCase().match(/\.(WMV)$/i)) {
    return true
  }
  return false
}

// audio
exports.isAudioExt = (fileName) => {
  fileName = fileName.substring(fileName.lastIndexOf('.'))
  if (fileName.toUpperCase().match(/\.(wav)$/i)) {
    return true
  }
  if (fileName.toUpperCase().match(/\.(mp3)$/i)) {
    return true
  }
  if (fileName.toUpperCase().match(/\.(wma)$/i)) {
    return true
  }
  if (fileName.toUpperCase().match(/\.(aac)$/i)) {
    return true
  }
  if (fileName.toUpperCase().match(/\.(m4a)$/i)) {
    return true
  }
  if (fileName.toUpperCase().match(/\.(flac)$/i)) {
    return true
  }
  if (fileName.toUpperCase().match(/\.(ogg)$/i)) {
    return true
  }
  if (fileName.toUpperCase().match(/\.(WAV)$/i)) {
    return true
  }
  if (fileName.toUpperCase().match(/\.(MP3)$/i)) {
    return true
  }
  if (fileName.toUpperCase().match(/\.(WMA)$/i)) {
    return true
  }
  if (fileName.toUpperCase().match(/\.(AAC)$/i)) {
    return true
  }
  if (fileName.toUpperCase().match(/\.(M4A)$/i)) {
    return true
  }
  if (fileName.toUpperCase().match(/\.(FLAC)$/i)) {
    return true
  }
  if (fileName.toUpperCase().match(/\.(OGG)$/i)) {
    return true
  }
  return false
}

// PDF
exports.isPdfExt = (fileName) => {
  fileName = fileName.substring(fileName.lastIndexOf('.'))
  if (fileName.toUpperCase().match(/\.(pdf)$/i)) {
    return true
  }
  if (fileName.toUpperCase().match(/\.(PDF)$/i)) {
    return true
  }
  return false
}

// zip files
exports.isCompExt = (fileName) => {
  fileName = fileName.substring(fileName.lastIndexOf('.'))
  if (fileName.toUpperCase().match(/\.(zip)$/i)) {
    return true
  }
  if (fileName.toUpperCase().match(/\.(rar)$/i)) {
    return true
  }
  if (fileName.toUpperCase().match(/\.(7z)$/i)) {
    return true
  }
  if (fileName.toUpperCase().match(/\.(ZIP)$/i)) {
    return true
  }
  if (fileName.toUpperCase().match(/\.(RAR)$/i)) {
    return true
  }
  if (fileName.toUpperCase().match(/\.(7Z)$/i)) {
    return true
  }
  return false
}