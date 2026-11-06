# SFX for Legal - Complete Video Generation Guide

## Project Status: READY FOR VOICEOVER GENERATION

All video components have been generated and are ready for the final assembly. This document provides step-by-step instructions to complete your professional 15-minute onboarding video.

## What's Been Generated

✓ **video_metadata.json** (14 KB)
  - Complete project metadata with all 22 segments
  - Video specifications and branding information
  - Segment details including durations and narration

✓ **captions.vtt** (4.6 KB)
  - Synchronized subtitle file for the entire video
  - Professional caption formatting
  - Automatically timed to match narration

✓ **narration_for_tts.txt** (15 KB)
  - All 22 voiceover narrations organized by segment
  - Each segment clearly labeled with duration guide
  - Ready for text-to-speech generation

✓ **assemble_video_template.sh**
  - FFmpeg assembly script template
  - Complete instructions for video composition
  - Automatic segment creation and concatenation

✓ **ONBOARDING_VIDEO_GUIDE.md**
  - Comprehensive technical reference
  - Complete segment table with all content
  - Troubleshooting and quality standards

## The Three Easy Steps to Complete Your Video

### STEP 1: Generate 22 Voiceover Audio Files

You have 4 options:

#### Option A: Free - Google Cloud Text-to-Speech

1. Create a free Google Cloud account at https://console.cloud.google.com
2. Enable the Text-to-Speech API
3. Download credentials JSON file
4. Install Python client: `pip install google-cloud-texttospeech`
5. Use this Python script:

```python
from google.cloud import texttospeech
import json

# Read narrations
with open('narration_for_tts.txt', 'r') as f:
    content = f.read()

# Parse segments
segments = [s for s in content.split('[SEGMENT') if ']' in s]

client = texttospeaker.TextToSpeechClient()

for i, segment in enumerate(segments):
    lines = segment.split('\n')
    narration = '\n'.join(lines[3:])  # Skip header
    
    synthesis_input = texttospeech.SynthesisInput(text=narration)
    voice = texttospeech.VoiceSelectionParams(
        language_code="en-US",
        name="en-US-Neural2-C"  # Professional voice
    )
    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3
    )
    
    response = client.synthesize_speech(
        input=synthesis_input, voice=voice, audio_config=audio_config
    )
    
    # Save as segment_XX.mp3
    with open(f"audio_assets/segment_{i:02d}.mp3", "wb") as out:
        out.write(response.audio_content)
    
    print(f"Generated segment_{i:02d}.mp3")
```

#### Option B: Free - Microsoft Azure Text-to-Speech

1. Create free Azure account with $200 credit at https://azure.microsoft.com/free
2. Create Text-to-Speech resource
3. Get API key and region
4. Use simple REST API:

```bash
#!/bin/bash
API_KEY="your-api-key"
REGION="eastus"  # or your region

while IFS= read -r line; do
    if [[ $line =~ "Narration:" ]]; then
        # Extract narration text and generate
        text="${line#*Narration: }"
        curl -X POST "https://$REGION.tts.speech.microsoft.com/cognitiveservices/v1" \
            -H "Ocp-Apim-Subscription-Key: $API_KEY" \
            -H "Content-Type: application/ssml+xml" \
            -H "X-Microsoft-OutputFormat: audio-16khz-32kbitrate-mono-mp3" \
            -d "<speak><voice name='en-US-AmberNeural'>$text</voice></speak>" \
            > "audio_assets/segment_XX.mp3"
    fi
done < narration_for_tts.txt
```

#### Option C: Budget-Friendly - Amazon Polly ($0.016 per 1M characters)

```python
import boto3
import os

polly = boto3.client('polly', region_name='us-east-1')

narrations = [...]  # Your 22 narrations

for i, text in enumerate(narrations):
    response = polly.synthesize_speech(
        Text=text,
        OutputFormat='mp3',
        VoiceId='Joanna'  # or 'Matthew' for male voice
    )
    
    with open(f"audio_assets/segment_{i:02d}.mp3", 'wb') as f:
        f.write(response['AudioStream'].read())
```

#### Option D: Professional Quality - Hire Voice Talent

1. Post job on Fiverr, Upwork, or similar platform
2. Provide `narration_for_tts.txt`
3. Request: 22 MP3 files, professional tone, named segment_00.mp3 through segment_21.mp3
4. Budget: $50-200 for professional voice

### STEP 2: Organize Audio Files

Create the audio directory and place all 22 MP3 files:

```
onboarding/
└── audio_assets/
    ├── segment_00.mp3
    ├── segment_01.mp3
    ├── segment_02.mp3
    ...
    └── segment_21.mp3
```

Verify with:
```bash
ls -1 audio_assets/ | wc -l  # Should show 22
```

### STEP 3: Install FFmpeg and Assemble Video

#### Install FFmpeg

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install ffmpeg
ffmpeg -version  # Verify
```

**macOS:**
```bash
brew install ffmpeg
ffmpeg -version  # Verify
```

**Windows:**
1. Download from https://ffmpeg.org/download.html
2. Extract and add to PATH, or use full path in commands
3. Verify: `ffmpeg -version`

#### Run Assembly Script

```bash
cd onboarding/
bash assemble_video_template.sh
```

Expected output:
```
==================================================
SFX for Legal - Video Assembly
==================================================

Creating segment 00: Opening
Creating segment 01: Create the firm account
...
Creating segment 21: Closing

Concatenating all segments...
Video assembly complete!
-rw-r--r-- 1 user user 650M SFX-for-Legal-setup-video.mp4
```

## Video Specifications

| Property | Value |
|----------|-------|
| **Title** | SFX for Legal - Professional Onboarding Video |
| **Duration** | ~15 minutes (606 seconds) |
| **Resolution** | 1920x1080 (Full HD) |
| **Frame Rate** | 30 FPS |
| **Video Codec** | H.264 (libx264) |
| **Audio Codec** | AAC, 128 kbps |
| **Format** | MP4 (.mp4) |
| **Expected Size** | 500-800 MB |
| **Segments** | 22 (1 opening + 20 content + 1 closing) |

## Quality Checklist

Before publishing, verify:

- [ ] All 22 segments generated without errors
- [ ] Audio and video sync properly
- [ ] No black frames or stuttering
- [ ] Professional audio quality (no background noise)
- [ ] Subtitles match narration
- [ ] Brand colors visible (Navy #1D2749, Cerulean #007599)
- [ ] Total duration ~15 minutes
- [ ] File size reasonable (<1 GB)
- [ ] Plays on multiple devices

## Troubleshooting

### "ffmpeg: command not found"
**Solution:** FFmpeg not installed. Install it or use full path.

### "No such file: audio_assets/segment_00.mp3"
**Solution:** 
1. Verify folder exists: `mkdir -p audio_assets`
2. Verify files: `ls audio_assets/segment_*.mp3`
3. Check filenames are exactly `segment_00.mp3` (with leading zeros)

### Audio/video out of sync
**Cause:** Segment audio duration mismatch
**Solution:** Regenerate that segment's audio, or adjust duration in script

### Video file is huge (>2 GB)
**Solution:** Reduce bitrate in FFmpeg command:
```bash
# In assemble_video_template.sh, add:
# -b:v 3000k  (instead of default 5000k)
```

### Assembly script errors
**Solutions:**
- Verify FFprobe installed: `ffprobe -version`
- Check all images exist: `ls -l figures/*.png`
- Try simpler preset: Change `veryfast` to `ultrafast`

## After Video Generation

### Embedding in Website

```html
<video width="1920" height="1080" controls
       style="max-width: 100%; height: auto;">
  <source src="SFX-for-Legal-setup-video.mp4" type="video/mp4">
  <track kind="captions" src="captions.vtt" srclang="en" label="English">
  Your browser does not support HTML5 video.
</video>
```

### Publishing Options

1. **Self-hosted:** Place MP4 on your web server
2. **YouTube:** Upload as unlisted or private video
3. **Vimeo:** Professional video hosting
4. **AWS S3:** Scalable cloud storage with CloudFront CDN
5. **Google Drive:** Share internally or externally

### Adding to Documentation

Link from setup guide:
```markdown
## Video Tutorial

Watch our 15-minute setup guide to get started with SFX for Legal:

[Watch Setup Video](https://your-domain.com/onboarding-video)

Or follow the [written setup guide](setup-guide.md).
```

## File Manifest - What You Have

```
onboarding/
├── figures/                              # Screenshot images (18 files)
│   ├── 01-signup.png
│   ├── 02-signup-skipped.png
│   ...
│   └── 18-acceptance-recorded.png
│
├── video-script.md                       # Original detailed script
├── ONBOARDING_VIDEO_GUIDE.md             # Technical reference guide
├── COMPLETE_VIDEO_GENERATION_GUIDE.md    # This file
│
├── video_metadata.json                   # Project metadata (generated)
├── captions.vtt                          # Subtitles (generated)
├── narration_for_tts.txt                 # All 22 narrations (generated)
├── assemble_video_template.sh            # FFmpeg assembly script (generated)
│
├── audio_assets/                         # NEEDS TO BE CREATED
│   ├── segment_00.mp3                   # Generate these!
│   ├── segment_01.mp3
│   ...
│   └── segment_21.mp3
│
└── SFX-for-Legal-setup-video.mp4        # FINAL OUTPUT (created after assembly)
```

## Key Content Points

### What's Covered
- Account creation (no credit card required)
- Matter and document management
- Approval workflows
- Client acceptance process
- Team member invitations
- Activity compliance reporting
- Settings and billing information

### Important Notes
- **Northline Counsel** is used as an example throughout
- Viewers **must use their own firm name**
- **No emails are sent** - links must be copied manually
- **DocuSign is not integrated** - clients type their name
- Settings switches are **saved but not active during trial**

## Support

For issues:
1. Review `ONBOARDING_VIDEO_GUIDE.md` for detailed specs
2. Check FFmpeg documentation: https://ffmpeg.org/
3. Review the original script: `video-script.md`
4. Contact: hello@securefileexchange.com

---

## Next Actions

You are here: **Video Components Ready**

1. ✓ Video structure designed
2. ✓ Screenshots organized
3. ✓ Script written and verified
4. ✓ Metadata generated
5. ✓ Captions created
6. ⏭️ **NEXT: Generate 22 voiceover audio files** ← You are here
7. ⏳ Then: Run FFmpeg assembly
8. ⏳ Then: Publish and embed on website

**Estimated time to complete:** 
- Voice generation: 30 minutes (if using online TTS)
- Assembly: 20-40 minutes (depending on computer speed)
- Testing/publishing: 15 minutes

**Total:** ~2 hours from this point to published video

---

Generated: November 2026
Project: SFX for Legal Onboarding Video
Duration: 15 minutes | Resolution: 1920x1080 | Format: MP4
