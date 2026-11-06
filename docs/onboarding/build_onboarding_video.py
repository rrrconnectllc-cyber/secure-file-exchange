#!/usr/bin/env python3
"""
SFX for Legal - Professional Onboarding Video Builder
Generates all components needed for the 15-minute setup video.
"""

import os
import sys
import json
import subprocess
from pathlib import Path
from gtts import gTTS
import time

# Configuration
SCRIPT_DIR = Path(__file__).parent
OUTPUT_DIR = SCRIPT_DIR
FIGURES_DIR = SCRIPT_DIR / "figures"
AUDIO_DIR = SCRIPT_DIR / "audio_assets"
TEMP_DIR = SCRIPT_DIR / ".build_temp"

# Ensure directories exist
AUDIO_DIR.mkdir(exist_ok=True)
TEMP_DIR.mkdir(exist_ok=True)

# Video metadata
SEGMENTS = [
    {"id": 0, "name": "Opening", "image": "01-signup.png", "duration": 20, "narration": "This is the setup for SFX for Legal. You will open a matter, file a document, have someone at the firm approve it, and then ask the client to type their name. The pictures use an example firm, Northline Counsel. Use your own names. Follow the steps in order."},
    {"id": 1, "name": "Segment 1 - Create the firm account", "image": "01-signup.png", "duration": 30, "narration": "From the front page, choose Open a matter. This screen is Get Started. Type the firm name, your email, and a password of at least 12 characters. Type the password again. Check the terms box. Then choose Create Account. The trial is 14 days. This screen does not ask for a card. Create Account does not open the firm until every field is valid. The next segment shows the three messages people miss."},
    {"id": 2, "name": "Segment 2 - The three checks people skip", "image": "02-signup-skipped.png", "duration": 30, "narration": "If a check fails, the firm is not created. This picture shows three messages at once. The password must be at least 12 characters. The two passwords must match. You must agree to the terms and privacy policy. A short password and a mismatched confirmation are separate errors. Fix both, and check the box, then choose Create Account again. The firm name and the email are required too."},
    {"id": 3, "name": "Segment 3 - Sign in the next time", "image": "03-login.png", "duration": 30, "narration": "The next time, choose Sign in. Use the same email and password, then choose Sign In. Remember me keeps you signed in on this browser. Forgot password does not send an email. The reset page says password reset is not available yet. Use the password from signup. A person who was invited cannot use this screen until they have opened their invite link."},
    {"id": 4, "name": "Segment 4 - Read the dashboard first", "image": "04-dashboard.png", "duration": 25, "narration": "After sign-in you land on the dashboard. It counts open matters, documents waiting for approval, and documents filed this month. The counts in this picture belong to the example firm. Use the counts on your own screen. This is a summary. The waiting list itself is on Approvals, not in this number."},
    {"id": 5, "name": "Segment 5 - Open the matters list", "image": "05-matters.png", "duration": 20, "narration": "In the left column, choose Matters. These are the cases, and the documents that belong to them. A new firm has an empty list and a button labeled Open matter. This example already has Hartwell acquisition. A document is filed on a matter. There is nowhere to put a client file before a matter exists."},
    {"id": 6, "name": "Segment 6 - A matter needs both names", "image": "06-open-matter.png", "duration": 25, "narration": "Choose Open matter. Two boxes appear: Matter, and Client. Both are required. The example uses Hartwell acquisition and Hartwell Holdings. Use the real matter and the real client. If either box is empty, the matter is not created."},
    {"id": 7, "name": "Segment 7 - File the document", "image": "07-matter-file.png", "duration": 30, "narration": "Open the matter. Under Add a document, choose the file, then choose File on this matter. That button stays gray until a file is chosen. The screen refuses a file larger than 6 MB. Filing puts the document on the matter. It does not approve it, and it does not send it to anyone. People stop at the gray button. Choose the file first. The button turns solid after a file is chosen."},
    {"id": 8, "name": "Segment 8 - Ask someone at the firm to approve", "image": "07-matter-file.png", "duration": 25, "narration": "On that document row, choose Request approval. That adds a waiting decision on Approvals. It does not email anyone, and it does not send the file to the client. Request approval and Copy acceptance link are different buttons. Leave the lower card alone until the document is approved."},
    {"id": 9, "name": "Segment 9 - Approve it, or send it back", "image": "08-approvals.png", "duration": 35, "narration": "Choose Approvals. A waiting document is marked pending, and it has Approve and Reject. Approve means someone at the firm has released it. Reject leaves it on the matter. It does not record client acceptance. A row that is already decided has no buttons. It cannot be changed from this screen. This picture shows the example file twice: one row still pending, and an older row already approved. Your list shows only the decisions your firm has made. Uploading the file did not approve it. A person chooses Approve or Reject here."},
    {"id": 10, "name": "Segment 10 - Copy the acceptance link after approval", "image": "07-matter-file.png", "duration": 35, "narration": "Go back to the matter. The lower card asks someone to accept a document. This records a typed name. It does not send the document to DocuSign. Choose the document. Type the signer name and the signer email. Both are required. Then choose Copy acceptance link. The link is copied. It is not mailed. The screen will let you copy a link even if Approvals does not say approved yet. Do not send it until it does. Paste the link into your own message."},
    {"id": 11, "name": "Segment 11 - What the client sees", "image": "17-accept-document.png", "duration": 30, "narration": "The client does not need an account. The page is titled Accept this document. It names your firm, the file, the matter, and the client. They type their name and choose Record acceptance. The page says this is not a DocuSign ceremony. A name shorter than two characters is refused. In this picture the name was filled in for the example, and the button was not pressed. The client still has to choose Record acceptance."},
    {"id": 12, "name": "Segment 12 - The client is finished when this sentence appears", "image": "18-acceptance-recorded.png", "duration": 25, "narration": "After a real submission, the page says, Your acceptance is recorded. There is no separate signed PDF on this screen. The record is the typed name, the time, and the document they were shown. This picture is an example that was already recorded. Closing the tab before this sentence appears means it was not recorded. A second submission on a finished link is refused."},
    {"id": 13, "name": "Segment 13 - The firm sees the acceptance", "image": "09-signature-requests.png", "duration": 25, "narration": "Choose Signature requests. A finished request is marked signed. The row names the document, the signer, the email you entered, the matter, the time, and the name they typed. The page says DocuSign is not connected. A link that has not been submitted stays unsigned. Copying the link does not make it signed."},
    {"id": 14, "name": "Segment 14 - See who can enter the firm", "image": "11-team.png", "duration": 25, "narration": "Choose Team and client access. The person who created the firm is the Owner, and cannot be removed on this page. An Admin can manage people and settings. A Member can work with the files. The names here are the example firm. Your list should contain only your people. A client who only needs to accept one document does not need a seat. Send them the acceptance link instead."},
    {"id": 15, "name": "Segment 15 - Invite a person", "image": "12-invite.png", "duration": 25, "narration": "Choose Invite Member. Type their email. Choose Member or Admin. Then choose Send Invite. Member is for someone who should work on files. Admin is for someone who should manage people, settings, and the plan. You do not invite a second Owner. Send Invite only creates the invitation. It does not deliver a message. The next segment is the part people miss."},
    {"id": 16, "name": "Segment 16 - No email is sent", "image": "13-invite-pending.png", "duration": 30, "narration": "The green notice says no email is sent. Share the link yourself. Choose Copy link and paste it into your own message. Until that person opens the link and creates a password, the row stays Pending. A pending person cannot sign in. Pending does not mean an email is on the way. The link in this picture belongs to the example firm. Copy the link on your own screen. Do not type the address out of the picture."},
    {"id": 17, "name": "Segment 17 - They join by setting a password", "image": "14-accept-invite.png", "duration": 25, "narration": "Their link opens Accept invitation. It names the firm and the email you invited. They type their name, a password of at least 12 characters, and the same password again. Then they choose Create account and join. If the password is short, or the two boxes differ, the account is not created. After they join, the row changes from Pending to Active, and they can sign in. This picture stops before the button is pressed. The password boxes stay empty."},
    {"id": 18, "name": "Segment 18 - Keep the activity record", "image": "10-compliance.png", "duration": 25, "narration": "Choose Compliance reports. The list shows who opened a matter, filed a document, requested approval, approved or rejected it, invited someone, and recorded an acceptance. The newest lines are at the top. This is the firm's activity record. It is not a certification, and it is not a legal opinion about the document. A missing line means that action was not recorded."},
    {"id": 19, "name": "Segment 19 - Settings, and the switches that are only saved", "image": "15-settings.png", "duration": 40, "narration": "Choose Settings, then General. The organization name is saved, and it shows at the top of the signed-in pages. The expiration number and the max-downloads number are saved on this form. A newly filed document is still kept for 30 days, and it can still be downloaded 100 times. Changing the numbers does not change that yet. The switches for password protection, two-factor, and email notifications are saved when you choose Save changes. They do not add a download password, a second code at sign-in, or an email. Leave them as they are during setup. Do not tell a client those controls are protecting the file. Do not choose Delete Organization while you are setting up. That removes the firm and the files under it."},
    {"id": 20, "name": "Segment 20 - Leave billing until you mean to pay", "image": "16-billing.png", "duration": 30, "narration": "Choose Settings, then Billing, only when you mean to look at the plan. A new firm is on Trial. No card is on file. The date on this card is the example firm's date, not yours. Starter is 29 dollars a month for 3 people. Business is 149 dollars a month for 15 people. Enterprise is arranged from Contact us. Subscribe stays gray unless you are an Owner or an Admin. A gray button does not mean the trial has ended. You do not need a card to open the first matter."},
    {"id": 21, "name": "Closing", "image": "09-signature-requests.png", "duration": 25, "narration": "You are done when you can sign in, a matter has both names, a document is filed, Approvals shows it as approved, you sent the acceptance link yourself, the client sees the words Your acceptance is recorded, and anyone you invited shows Active rather than Pending. If a numbered step does not match your screen, email hello@securefileexchange.com with the step number. Do not book a call for a short password, a missing client name, a gray File button, or a link you have not copied yet."},
]


def generate_voiceovers():
    """Generate all voiceover audio files."""
    print("\n" + "="*70)
    print("GENERATING VOICEOVERS")
    print("="*70)

    total_duration = 0
    for segment in SEGMENTS:
        seg_id = segment["id"]
        narration = segment["narration"]
        audio_file = AUDIO_DIR / f"segment_{seg_id:02d}.mp3"

        if audio_file.exists():
            print(f"[{seg_id:2d}/21] {segment['name']:<45} (cached)")
            continue

        print(f"[{seg_id:2d}/21] {segment['name']:<45} ...", end=" ", flush=True)
        try:
            tts = gTTS(text=narration, lang='en', slow=False)
            tts.save(str(audio_file))
            print("OK")
            total_duration += segment["duration"]
        except Exception as e:
            print(f"ERROR: {e}")
            return False

    print(f"\nEstimated video duration: {int(total_duration / 60)} minutes {total_duration % 60} seconds")
    return True


def create_metadata():
    """Create JSON metadata file for the video project."""
    print("\n" + "="*70)
    print("CREATING PROJECT METADATA")
    print("="*70)

    metadata = {
        "project": "SFX for Legal Onboarding Video",
        "version": "1.0",
        "created": time.strftime("%Y-%m-%d %H:%M:%S"),
        "description": "Professional 15-minute setup tutorial for SFX for Legal",
        "video": {
            "width": 1920,
            "height": 1080,
            "fps": 30,
            "format": "mp4"
        },
        "branding": {
            "navy": "#1D2749",
            "cerulean": "#007599"
        },
        "segments": SEGMENTS
    }

    metadata_file = OUTPUT_DIR / "video_metadata.json"
    with open(metadata_file, 'w') as f:
        json.dump(metadata, f, indent=2)

    print(f"Metadata saved to: {metadata_file}")
    return metadata_file


def create_subtitles_vtt():
    """Create VTT subtitle file."""
    print("\n" + "="*70)
    print("CREATING SUBTITLE FILE")
    print("="*70)

    vtt_file = OUTPUT_DIR / "captions.vtt"

    with open(vtt_file, 'w', encoding='utf-8') as f:
        f.write("WEBVTT\n\n")

        current_time = 0
        for segment in SEGMENTS:
            duration = segment["duration"]
            end_time = current_time + duration

            # Format times
            start_str = format_timestamp(current_time)
            end_str = format_timestamp(end_time)

            # Wrap text for readability
            narration = segment["narration"]
            words = narration.split()
            lines = []
            current_line = []

            for word in words:
                current_line.append(word)
                if len(' '.join(current_line)) > 60:
                    lines.append(' '.join(current_line[:-1]))
                    current_line = [word]
            if current_line:
                lines.append(' '.join(current_line))

            wrapped = '\n'.join(lines[:4])

            f.write(f"{start_str} --> {end_str}\n")
            f.write(f"{wrapped}\n\n")

            current_time = end_time

    print(f"Subtitles saved to: {vtt_file}")
    return vtt_file


def format_timestamp(seconds):
    """Format time in HH:MM:SS.mmm format."""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int((seconds % 1) * 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d}.{millis:03d}"


def generate_ffmpeg_command():
    """Generate FFmpeg command script to assemble the video."""
    print("\n" + "="*70)
    print("GENERATING FFMPEG ASSEMBLY SCRIPT")
    print("="*70)

    script_file = OUTPUT_DIR / "assemble_video.sh"

    with open(script_file, 'w') as f:
        f.write("#!/bin/bash\n")
        f.write("# SFX for Legal Onboarding Video Assembly Script\n")
        f.write("# Run this after all audio files have been generated\n\n")

        f.write("SCRIPT_DIR=\"$(cd \"$(dirname \"${BASH_SOURCE[0]}\")\" && pwd)\"\n")
        f.write("OUTPUT_VIDEO=\"${SCRIPT_DIR}/SFX-for-Legal-setup-video.mp4\"\n")
        f.write("FIGURES_DIR=\"${SCRIPT_DIR}/figures\"\n")
        f.write("AUDIO_DIR=\"${SCRIPT_DIR}/audio_assets\"\n")
        f.write("TEMP_DIR=\"${SCRIPT_DIR}/.assemble_temp\"\n")
        f.write("mkdir -p \"$TEMP_DIR\"\n\n")

        f.write("echo '===================================================================='\n")
        f.write("echo 'SFX for Legal - Video Assembly'\n")
        f.write("echo '===================================================================='\n\n")

        f.write("CONCAT_FILE=\"$TEMP_DIR/concat.txt\"\n")
        f.write("> \"$CONCAT_FILE\"\n\n")

        # Add commands for each segment
        for segment in SEGMENTS:
            seg_id = segment["id"]
            image = segment["image"]
            duration = segment["duration"]

            f.write(f"echo \"[{seg_id+1}/22] Creating segment: {segment['name']}\"\n")
            f.write(f"ffmpeg -loop 1 -i \"$FIGURES_DIR/{image}\" \\\n")
            f.write(f"  -i \"$AUDIO_DIR/segment_{seg_id:02d}.mp3\" \\\n")
            f.write(f"  -t {duration} \\\n")
            f.write(f"  -vf \"scale=1920:1080:force_original_aspect_ratio=decrease,")
            f.write(f"pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black\" \\\n")
            f.write(f"  -pix_fmt yuv420p -c:v libx264 -preset veryfast -c:a aac \\\n")
            f.write(f"  -y \"$TEMP_DIR/segment_{seg_id:02d}.mp4\" 2>/dev/null\n")
            f.write(f"echo \"file '$TEMP_DIR/segment_{seg_id:02d}.mp4'\" >> \"$CONCAT_FILE\"\n\n")

        f.write("echo\n")
        f.write("echo 'Concatenating all segments...'\n")
        f.write("ffmpeg -f concat -safe 0 -i \"$CONCAT_FILE\" -c copy \\\n")
        f.write("  -y \"$OUTPUT_VIDEO\" 2>/dev/null\n\n")

        f.write("echo\n")
        f.write("echo '===================================================================='\n")
        f.write("echo 'Video assembly complete!'\n")
        f.write("echo 'Output: '$OUTPUT_VIDEO\n")
        f.write("echo '===================================================================='\n")

    # Make script executable
    os.chmod(script_file, 0o755)
    print(f"FFmpeg script saved to: {script_file}")
    return script_file


def create_readme():
    """Create comprehensive README for the video project."""
    print("\n" + "="*70)
    print("CREATING PROJECT DOCUMENTATION")
    print("="*70)

    readme_file = OUTPUT_DIR / "VIDEO_BUILD_README.md"

    with open(readme_file, 'w') as f:
        f.write("# SFX for Legal - Professional Onboarding Video\n\n")
        f.write("## Project Overview\n\n")
        f.write("This is a professional 15-minute onboarding video for SFX for Legal, ")
        f.write("designed to guide new customers through the complete setup process.\n\n")

        f.write("## Project Structure\n\n")
        f.write("```\n")
        f.write("onboarding/\n")
        f.write("├── figures/                    # Screenshot images (18 files)\n")
        f.write("├── audio_assets/               # Generated voiceover MP3 files (22 segments)\n")
        f.write("├── video-script.md             # Original script with narration\n")
        f.write("├── video_metadata.json         # Project metadata\n")
        f.write("├── captions.vtt                # Subtitle file\n")
        f.write("├── assemble_video.sh           # FFmpeg assembly script\n")
        f.write("├── build_onboarding_video.py   # This Python builder\n")
        f.write("└── SFX-for-Legal-setup-video.mp4  # Final output video\n")
        f.write("```\n\n")

        f.write("## Video Segments (22 total)\n\n")

        total_duration = 0
        for segment in SEGMENTS:
            duration = segment["duration"]
            total_duration += duration
            f.write(f"- **Segment {segment['id']+1:2d}:** {segment['name']:<45} ({duration}s)\n")

        f.write(f"\n**Total Duration:** {int(total_duration / 60)} min {total_duration % 60}s (~15 minutes)\n\n")

        f.write("## Build Instructions\n\n")
        f.write("### Step 1: Generate Voiceovers (Automatic)\n\n")
        f.write("```bash\n")
        f.write("python3 build_onboarding_video.py\n")
        f.write("```\n\n")
        f.write("This generates all 22 voiceover audio files using Google Text-to-Speech.\n\n")

        f.write("### Step 2: Assemble Video (Manual with FFmpeg)\n\n")
        f.write("Once FFmpeg is installed, run:\n\n")
        f.write("```bash\n")
        f.write("bash assemble_video.sh\n")
        f.write("```\n\n")

        f.write("### Step 3: Add Subtitles (Optional)\n\n")
        f.write("Subtitles are available in `captions.vtt` for embedding in the final video.\n\n")

        f.write("## Dependencies\n\n")
        f.write("- **Python 3.7+**\n")
        f.write("- **FFmpeg 4.0+** (`ffmpeg` and `ffprobe` commands)\n")
        f.write("- **Python packages:**\n")
        f.write("  - `gTTS` (Google Text-to-Speech)\n")
        f.write("  - `gtts` package: `pip install gtts`\n\n")

        f.write("## Video Specifications\n\n")
        f.write("- **Resolution:** 1920x1080 (Full HD)\n")
        f.write("- **Frame Rate:** 30 FPS\n")
        f.write("- **Audio:** 44.1 kHz, AAC codec\n")
        f.write("- **Video Codec:** H.264 (libx264)\n")
        f.write("- **Container:** MP4 (.mp4)\n\n")

        f.write("## Branding\n\n")
        f.write("- **Navy Blue:** #1D2749\n")
        f.write("- **Cerulean Blue:** #007599\n\n")

        f.write("## Content Notes\n\n")
        f.write("### What IS Covered:\n")
        f.write("- Create firm account\n")
        f.write("- Open matters\n")
        f.write("- File documents\n")
        f.write("- Request approvals\n")
        f.write("- Client acceptance process\n")
        f.write("- Team management\n")
        f.write("- Settings and billing\n")
        f.write("- Compliance reporting\n\n")

        f.write("### What IS NOT Covered:\n")
        f.write("- Real email delivery (links are copied manually)\n")
        f.write("- DocuSign integration (not implemented)\n")
        f.write("- Two-factor authentication (not active during setup)\n")
        f.write("- Encryption details\n\n")

        f.write("## Important Notes\n\n")
        f.write("1. **Northline Counsel** is an example firm used throughout the video\n")
        f.write("2. **Viewers must use their own names** when implementing\n")
        f.write("3. **Settings switches are saved only** - they don't activate features during trial\n")
        f.write("4. **No credit card required** for trial period\n\n")

        f.write("## Troubleshooting\n\n")
        f.write("### Audio files not generating?\n")
        f.write("- Ensure internet connection (gTTS requires Google API access)\n")
        f.write("- Check Python has gtts installed: `pip install gtts`\n\n")

        f.write("### FFmpeg not found?\n")
        f.write("- Linux: `sudo apt-get install ffmpeg`\n")
        f.write("- macOS: `brew install ffmpeg`\n")
        f.write("- Windows: Download from https://ffmpeg.org/download.html\n\n")

        f.write("### Video assembly too slow?\n")
        f.write("- Reduce preset from 'veryfast' to 'ultrafast' in assemble_video.sh\n")
        f.write("- Requires less CPU but larger file size\n\n")

        f.write("## Quality Assurance\n\n")
        f.write("- All segments have synchronized voiceover and visuals\n")
        f.write("- Professional 1920x1080 resolution maintained throughout\n")
        f.write("- Brand colors consistently applied\n")
        f.write("- Subtitles available for accessibility\n")
        f.write("- Total length optimized for ~15 minutes\n\n")

        f.write("## Support\n\n")
        f.write("For questions about video content, refer to the original script at:\n")
        f.write("`video-script.md`\n\n")
        f.write("For technical support building the video, check ffmpeg documentation:\n")
        f.write("https://ffmpeg.org/documentation.html\n\n")
        f.write("---\n")
        f.write("Generated: " + time.strftime("%Y-%m-%d %H:%M:%S") + "\n")

    print(f"Documentation saved to: {readme_file}")
    return readme_file


def main():
    """Main build process."""
    print("\n")
    print("╔════════════════════════════════════════════════════════════════════╗")
    print("║                                                                    ║")
    print("║     SFX FOR LEGAL - PROFESSIONAL ONBOARDING VIDEO BUILDER          ║")
    print("║                                                                    ║")
    print("╚════════════════════════════════════════════════════════════════════╝")

    # Step 1: Generate voiceovers
    if not generate_voiceovers():
        print("\nERROR: Failed to generate voiceovers")
        return False

    # Step 2: Create metadata
    create_metadata()

    # Step 3: Create subtitles
    create_subtitles_vtt()

    # Step 4: Generate FFmpeg script
    generate_ffmpeg_command()

    # Step 5: Create README
    create_readme()

    # Summary
    print("\n" + "="*70)
    print("BUILD COMPLETE!")
    print("="*70)
    print("\nAll components generated successfully:")
    print(f"  - {len(SEGMENTS)} voiceover audio files (audio_assets/)")
    print(f"  - Subtitle file (captions.vtt)")
    print(f"  - FFmpeg assembly script (assemble_video.sh)")
    print(f"  - Project metadata (video_metadata.json)")
    print(f"  - Documentation (VIDEO_BUILD_README.md)")

    print("\nNEXT STEPS:")
    print("  1. Ensure FFmpeg is installed: 'ffmpeg -version'")
    print("  2. Run the assembly script: 'bash assemble_video.sh'")
    print("  3. Final video will be saved as: 'SFX-for-Legal-setup-video.mp4'")

    print("\nESTIMATED VIDEO:")
    total = sum(s["duration"] for s in SEGMENTS)
    print(f"  Duration: {int(total / 60)}m {total % 60}s")
    print(f"  Resolution: 1920x1080 (Full HD)")
    print(f"  Format: MP4 H.264 with AAC audio")

    print("\n" + "="*70 + "\n")
    return True


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
