#!/bin/bash
# SFX for Legal - Video Assembly Template
# This script requires:
# 1. FFmpeg installed (ffmpeg, ffprobe commands)
# 2. All screenshot images in figures/ folder
# 3. All 22 voiceover MP3s in audio_assets/ folder

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_VIDEO="${SCRIPT_DIR}/SFX-for-Legal-setup-video.mp4"
FIGURES_DIR="${SCRIPT_DIR}/figures"
AUDIO_DIR="${SCRIPT_DIR}/audio_assets"
TEMP_DIR="${SCRIPT_DIR}/.video_temp"

mkdir -p "$TEMP_DIR"

echo '=========================================================='
echo 'SFX for Legal - Video Assembly'
echo '=========================================================='

CONCAT_FILE="$TEMP_DIR/concat.txt"
> "$CONCAT_FILE"

echo "Creating segment 00: Opening"
ffmpeg -loop 1 \
    -i "$FIGURES_DIR/01-signup.png" \
    -i "$AUDIO_DIR/segment_00.mp3" \
    -t 20 \
    -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black" \
    -pix_fmt yuv420p \
    -c:v libx264 -preset veryfast \
    -c:a aac \
    -y "$TEMP_DIR/segment_00.mp4" 2>/dev/null

echo "file '$TEMP_DIR/segment_00.mp4'" >> "$CONCAT_FILE"

echo "Creating segment 01: Segment 1 - Create the firm account"
ffmpeg -loop 1 \
    -i "$FIGURES_DIR/01-signup.png" \
    -i "$AUDIO_DIR/segment_01.mp3" \
    -t 30 \
    -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black" \
    -pix_fmt yuv420p \
    -c:v libx264 -preset veryfast \
    -c:a aac \
    -y "$TEMP_DIR/segment_01.mp4" 2>/dev/null

echo "file '$TEMP_DIR/segment_01.mp4'" >> "$CONCAT_FILE"

echo "Creating segment 02: Segment 2 - The three checks people skip"
ffmpeg -loop 1 \
    -i "$FIGURES_DIR/02-signup-skipped.png" \
    -i "$AUDIO_DIR/segment_02.mp3" \
    -t 30 \
    -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black" \
    -pix_fmt yuv420p \
    -c:v libx264 -preset veryfast \
    -c:a aac \
    -y "$TEMP_DIR/segment_02.mp4" 2>/dev/null

echo "file '$TEMP_DIR/segment_02.mp4'" >> "$CONCAT_FILE"

echo "Creating segment 03: Segment 3 - Sign in the next time"
ffmpeg -loop 1 \
    -i "$FIGURES_DIR/03-login.png" \
    -i "$AUDIO_DIR/segment_03.mp3" \
    -t 30 \
    -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black" \
    -pix_fmt yuv420p \
    -c:v libx264 -preset veryfast \
    -c:a aac \
    -y "$TEMP_DIR/segment_03.mp4" 2>/dev/null

echo "file '$TEMP_DIR/segment_03.mp4'" >> "$CONCAT_FILE"

echo "Creating segment 04: Segment 4 - Read the dashboard first"
ffmpeg -loop 1 \
    -i "$FIGURES_DIR/04-dashboard.png" \
    -i "$AUDIO_DIR/segment_04.mp3" \
    -t 25 \
    -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black" \
    -pix_fmt yuv420p \
    -c:v libx264 -preset veryfast \
    -c:a aac \
    -y "$TEMP_DIR/segment_04.mp4" 2>/dev/null

echo "file '$TEMP_DIR/segment_04.mp4'" >> "$CONCAT_FILE"

echo "Creating segment 05: Segment 5 - Open the matters list"
ffmpeg -loop 1 \
    -i "$FIGURES_DIR/05-matters.png" \
    -i "$AUDIO_DIR/segment_05.mp3" \
    -t 20 \
    -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black" \
    -pix_fmt yuv420p \
    -c:v libx264 -preset veryfast \
    -c:a aac \
    -y "$TEMP_DIR/segment_05.mp4" 2>/dev/null

echo "file '$TEMP_DIR/segment_05.mp4'" >> "$CONCAT_FILE"

echo "Creating segment 06: Segment 6 - A matter needs both names"
ffmpeg -loop 1 \
    -i "$FIGURES_DIR/06-open-matter.png" \
    -i "$AUDIO_DIR/segment_06.mp3" \
    -t 25 \
    -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black" \
    -pix_fmt yuv420p \
    -c:v libx264 -preset veryfast \
    -c:a aac \
    -y "$TEMP_DIR/segment_06.mp4" 2>/dev/null

echo "file '$TEMP_DIR/segment_06.mp4'" >> "$CONCAT_FILE"

echo "Creating segment 07: Segment 7 - File the document"
ffmpeg -loop 1 \
    -i "$FIGURES_DIR/07-matter-file.png" \
    -i "$AUDIO_DIR/segment_07.mp3" \
    -t 30 \
    -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black" \
    -pix_fmt yuv420p \
    -c:v libx264 -preset veryfast \
    -c:a aac \
    -y "$TEMP_DIR/segment_07.mp4" 2>/dev/null

echo "file '$TEMP_DIR/segment_07.mp4'" >> "$CONCAT_FILE"

echo "Creating segment 08: Segment 8 - Ask someone at the firm to approve"
ffmpeg -loop 1 \
    -i "$FIGURES_DIR/07-matter-file.png" \
    -i "$AUDIO_DIR/segment_08.mp3" \
    -t 25 \
    -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black" \
    -pix_fmt yuv420p \
    -c:v libx264 -preset veryfast \
    -c:a aac \
    -y "$TEMP_DIR/segment_08.mp4" 2>/dev/null

echo "file '$TEMP_DIR/segment_08.mp4'" >> "$CONCAT_FILE"

echo "Creating segment 09: Segment 9 - Approve it, or send it back"
ffmpeg -loop 1 \
    -i "$FIGURES_DIR/08-approvals.png" \
    -i "$AUDIO_DIR/segment_09.mp3" \
    -t 35 \
    -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black" \
    -pix_fmt yuv420p \
    -c:v libx264 -preset veryfast \
    -c:a aac \
    -y "$TEMP_DIR/segment_09.mp4" 2>/dev/null

echo "file '$TEMP_DIR/segment_09.mp4'" >> "$CONCAT_FILE"

echo "Creating segment 10: Segment 10 - Copy the acceptance link after approval"
ffmpeg -loop 1 \
    -i "$FIGURES_DIR/07-matter-file.png" \
    -i "$AUDIO_DIR/segment_10.mp3" \
    -t 35 \
    -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black" \
    -pix_fmt yuv420p \
    -c:v libx264 -preset veryfast \
    -c:a aac \
    -y "$TEMP_DIR/segment_10.mp4" 2>/dev/null

echo "file '$TEMP_DIR/segment_10.mp4'" >> "$CONCAT_FILE"

echo "Creating segment 11: Segment 11 - What the client sees"
ffmpeg -loop 1 \
    -i "$FIGURES_DIR/17-accept-document.png" \
    -i "$AUDIO_DIR/segment_11.mp3" \
    -t 30 \
    -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black" \
    -pix_fmt yuv420p \
    -c:v libx264 -preset veryfast \
    -c:a aac \
    -y "$TEMP_DIR/segment_11.mp4" 2>/dev/null

echo "file '$TEMP_DIR/segment_11.mp4'" >> "$CONCAT_FILE"

echo "Creating segment 12: Segment 12 - The client is finished when this sentence appears"
ffmpeg -loop 1 \
    -i "$FIGURES_DIR/18-acceptance-recorded.png" \
    -i "$AUDIO_DIR/segment_12.mp3" \
    -t 25 \
    -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black" \
    -pix_fmt yuv420p \
    -c:v libx264 -preset veryfast \
    -c:a aac \
    -y "$TEMP_DIR/segment_12.mp4" 2>/dev/null

echo "file '$TEMP_DIR/segment_12.mp4'" >> "$CONCAT_FILE"

echo "Creating segment 13: Segment 13 - The firm sees the acceptance"
ffmpeg -loop 1 \
    -i "$FIGURES_DIR/09-signature-requests.png" \
    -i "$AUDIO_DIR/segment_13.mp3" \
    -t 25 \
    -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black" \
    -pix_fmt yuv420p \
    -c:v libx264 -preset veryfast \
    -c:a aac \
    -y "$TEMP_DIR/segment_13.mp4" 2>/dev/null

echo "file '$TEMP_DIR/segment_13.mp4'" >> "$CONCAT_FILE"

echo "Creating segment 14: Segment 14 - See who can enter the firm"
ffmpeg -loop 1 \
    -i "$FIGURES_DIR/11-team.png" \
    -i "$AUDIO_DIR/segment_14.mp3" \
    -t 25 \
    -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black" \
    -pix_fmt yuv420p \
    -c:v libx264 -preset veryfast \
    -c:a aac \
    -y "$TEMP_DIR/segment_14.mp4" 2>/dev/null

echo "file '$TEMP_DIR/segment_14.mp4'" >> "$CONCAT_FILE"

echo "Creating segment 15: Segment 15 - Invite a person"
ffmpeg -loop 1 \
    -i "$FIGURES_DIR/12-invite.png" \
    -i "$AUDIO_DIR/segment_15.mp3" \
    -t 25 \
    -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black" \
    -pix_fmt yuv420p \
    -c:v libx264 -preset veryfast \
    -c:a aac \
    -y "$TEMP_DIR/segment_15.mp4" 2>/dev/null

echo "file '$TEMP_DIR/segment_15.mp4'" >> "$CONCAT_FILE"

echo "Creating segment 16: Segment 16 - No email is sent"
ffmpeg -loop 1 \
    -i "$FIGURES_DIR/13-invite-pending.png" \
    -i "$AUDIO_DIR/segment_16.mp3" \
    -t 30 \
    -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black" \
    -pix_fmt yuv420p \
    -c:v libx264 -preset veryfast \
    -c:a aac \
    -y "$TEMP_DIR/segment_16.mp4" 2>/dev/null

echo "file '$TEMP_DIR/segment_16.mp4'" >> "$CONCAT_FILE"

echo "Creating segment 17: Segment 17 - They join by setting a password"
ffmpeg -loop 1 \
    -i "$FIGURES_DIR/14-accept-invite.png" \
    -i "$AUDIO_DIR/segment_17.mp3" \
    -t 25 \
    -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black" \
    -pix_fmt yuv420p \
    -c:v libx264 -preset veryfast \
    -c:a aac \
    -y "$TEMP_DIR/segment_17.mp4" 2>/dev/null

echo "file '$TEMP_DIR/segment_17.mp4'" >> "$CONCAT_FILE"

echo "Creating segment 18: Segment 18 - Keep the activity record"
ffmpeg -loop 1 \
    -i "$FIGURES_DIR/10-compliance.png" \
    -i "$AUDIO_DIR/segment_18.mp3" \
    -t 25 \
    -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black" \
    -pix_fmt yuv420p \
    -c:v libx264 -preset veryfast \
    -c:a aac \
    -y "$TEMP_DIR/segment_18.mp4" 2>/dev/null

echo "file '$TEMP_DIR/segment_18.mp4'" >> "$CONCAT_FILE"

echo "Creating segment 19: Segment 19 - Settings, and the switches that are only saved"
ffmpeg -loop 1 \
    -i "$FIGURES_DIR/15-settings.png" \
    -i "$AUDIO_DIR/segment_19.mp3" \
    -t 40 \
    -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black" \
    -pix_fmt yuv420p \
    -c:v libx264 -preset veryfast \
    -c:a aac \
    -y "$TEMP_DIR/segment_19.mp4" 2>/dev/null

echo "file '$TEMP_DIR/segment_19.mp4'" >> "$CONCAT_FILE"

echo "Creating segment 20: Segment 20 - Leave billing until you mean to pay"
ffmpeg -loop 1 \
    -i "$FIGURES_DIR/16-billing.png" \
    -i "$AUDIO_DIR/segment_20.mp3" \
    -t 30 \
    -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black" \
    -pix_fmt yuv420p \
    -c:v libx264 -preset veryfast \
    -c:a aac \
    -y "$TEMP_DIR/segment_20.mp4" 2>/dev/null

echo "file '$TEMP_DIR/segment_20.mp4'" >> "$CONCAT_FILE"

echo "Creating segment 21: Closing"
ffmpeg -loop 1 \
    -i "$FIGURES_DIR/09-signature-requests.png" \
    -i "$AUDIO_DIR/segment_21.mp3" \
    -t 25 \
    -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black" \
    -pix_fmt yuv420p \
    -c:v libx264 -preset veryfast \
    -c:a aac \
    -y "$TEMP_DIR/segment_21.mp4" 2>/dev/null

echo "file '$TEMP_DIR/segment_21.mp4'" >> "$CONCAT_FILE"


echo 'Concatenating all segments...'
ffmpeg -f concat -safe 0 -i "$CONCAT_FILE" -c copy -y "$OUTPUT_VIDEO" 2>/dev/null

echo
echo '=========================================================='
echo 'Video assembly complete!'
ls -lh "$OUTPUT_VIDEO"
echo '=========================================================='
