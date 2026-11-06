#!/usr/bin/env python3
"""
SFX for Legal - Video Components Preparation
Generates metadata and subtitles (no external dependencies needed)
"""

import json
import sys
from pathlib import Path
from datetime import datetime

# Script directory
SCRIPT_DIR = Path(__file__).parent
OUTPUT_DIR = SCRIPT_DIR

# Video segments with complete information
SEGMENTS = [
    (0, "Opening", "01-signup.png", 20, "This is the setup for SFX for Legal. You will open a matter, file a document, have someone at the firm approve it, and then ask the client to type their name. The pictures use an example firm, Northline Counsel. Use your own names. Follow the steps in order."),
    (1, "Segment 1 - Create the firm account", "01-signup.png", 30, "From the front page, choose Open a matter. This screen is Get Started. Type the firm name, your email, and a password of at least 12 characters. Type the password again. Check the terms box. Then choose Create Account. The trial is 14 days. This screen does not ask for a card. Create Account does not open the firm until every field is valid. The next segment shows the three messages people miss."),
    (2, "Segment 2 - The three checks people skip", "02-signup-skipped.png", 30, "If a check fails, the firm is not created. This picture shows three messages at once. The password must be at least 12 characters. The two passwords must match. You must agree to the terms and privacy policy. A short password and a mismatched confirmation are separate errors. Fix both, and check the box, then choose Create Account again. The firm name and the email are required too."),
    (3, "Segment 3 - Sign in the next time", "03-login.png", 30, "The next time, choose Sign in. Use the same email and password, then choose Sign In. Remember me keeps you signed in on this browser. Forgot password does not send an email. The reset page says password reset is not available yet. Use the password from signup. A person who was invited cannot use this screen until they have opened their invite link."),
    (4, "Segment 4 - Read the dashboard first", "04-dashboard.png", 25, "After sign-in you land on the dashboard. It counts open matters, documents waiting for approval, and documents filed this month. The counts in this picture belong to the example firm. Use the counts on your own screen. This is a summary. The waiting list itself is on Approvals, not in this number."),
    (5, "Segment 5 - Open the matters list", "05-matters.png", 20, "In the left column, choose Matters. These are the cases, and the documents that belong to them. A new firm has an empty list and a button labeled Open matter. This example already has Hartwell acquisition. A document is filed on a matter. There is nowhere to put a client file before a matter exists."),
    (6, "Segment 6 - A matter needs both names", "06-open-matter.png", 25, "Choose Open matter. Two boxes appear: Matter, and Client. Both are required. The example uses Hartwell acquisition and Hartwell Holdings. Use the real matter and the real client. If either box is empty, the matter is not created."),
    (7, "Segment 7 - File the document", "07-matter-file.png", 30, "Open the matter. Under Add a document, choose the file, then choose File on this matter. That button stays gray until a file is chosen. The screen refuses a file larger than 6 MB. Filing puts the document on the matter. It does not approve it, and it does not send it to anyone. People stop at the gray button. Choose the file first. The button turns solid after a file is chosen."),
    (8, "Segment 8 - Ask someone at the firm to approve", "07-matter-file.png", 25, "On that document row, choose Request approval. That adds a waiting decision on Approvals. It does not email anyone, and it does not send the file to the client. Request approval and Copy acceptance link are different buttons. Leave the lower card alone until the document is approved."),
    (9, "Segment 9 - Approve it, or send it back", "08-approvals.png", 35, "Choose Approvals. A waiting document is marked pending, and it has Approve and Reject. Approve means someone at the firm has released it. Reject leaves it on the matter. It does not record client acceptance. A row that is already decided has no buttons. It cannot be changed from this screen. This picture shows the example file twice: one row still pending, and an older row already approved. Your list shows only the decisions your firm has made. Uploading the file did not approve it. A person chooses Approve or Reject here."),
    (10, "Segment 10 - Copy the acceptance link after approval", "07-matter-file.png", 35, "Go back to the matter. The lower card asks someone to accept a document. This records a typed name. It does not send the document to DocuSign. Choose the document. Type the signer name and the signer email. Both are required. Then choose Copy acceptance link. The link is copied. It is not mailed. The screen will let you copy a link even if Approvals does not say approved yet. Do not send it until it does. Paste the link into your own message."),
    (11, "Segment 11 - What the client sees", "17-accept-document.png", 30, "The client does not need an account. The page is titled Accept this document. It names your firm, the file, the matter, and the client. They type their name and choose Record acceptance. The page says this is not a DocuSign ceremony. A name shorter than two characters is refused. In this picture the name was filled in for the example, and the button was not pressed. The client still has to choose Record acceptance."),
    (12, "Segment 12 - The client is finished when this sentence appears", "18-acceptance-recorded.png", 25, "After a real submission, the page says, Your acceptance is recorded. There is no separate signed PDF on this screen. The record is the typed name, the time, and the document they were shown. This picture is an example that was already recorded. Closing the tab before this sentence appears means it was not recorded. A second submission on a finished link is refused."),
    (13, "Segment 13 - The firm sees the acceptance", "09-signature-requests.png", 25, "Choose Signature requests. A finished request is marked signed. The row names the document, the signer, the email you entered, the matter, the time, and the name they typed. The page says DocuSign is not connected. A link that has not been submitted stays unsigned. Copying the link does not make it signed."),
    (14, "Segment 14 - See who can enter the firm", "11-team.png", 25, "Choose Team and client access. The person who created the firm is the Owner, and cannot be removed on this page. An Admin can manage people and settings. A Member can work with the files. The names here are the example firm. Your list should contain only your people. A client who only needs to accept one document does not need a seat. Send them the acceptance link instead."),
    (15, "Segment 15 - Invite a person", "12-invite.png", 25, "Choose Invite Member. Type their email. Choose Member or Admin. Then choose Send Invite. Member is for someone who should work on files. Admin is for someone who should manage people, settings, and the plan. You do not invite a second Owner. Send Invite only creates the invitation. It does not deliver a message. The next segment is the part people miss."),
    (16, "Segment 16 - No email is sent", "13-invite-pending.png", 30, "The green notice says no email is sent. Share the link yourself. Choose Copy link and paste it into your own message. Until that person opens the link and creates a password, the row stays Pending. A pending person cannot sign in. Pending does not mean an email is on the way. The link in this picture belongs to the example firm. Copy the link on your own screen. Do not type the address out of the picture."),
    (17, "Segment 17 - They join by setting a password", "14-accept-invite.png", 25, "Their link opens Accept invitation. It names the firm and the email you invited. They type their name, a password of at least 12 characters, and the same password again. Then they choose Create account and join. If the password is short, or the two boxes differ, the account is not created. After they join, the row changes from Pending to Active, and they can sign in. This picture stops before the button is pressed. The password boxes stay empty."),
    (18, "Segment 18 - Keep the activity record", "10-compliance.png", 25, "Choose Compliance reports. The list shows who opened a matter, filed a document, requested approval, approved or rejected it, invited someone, and recorded an acceptance. The newest lines are at the top. This is the firm's activity record. It is not a certification, and it is not a legal opinion about the document. A missing line means that action was not recorded."),
    (19, "Segment 19 - Settings, and the switches that are only saved", "15-settings.png", 40, "Choose Settings, then General. The organization name is saved, and it shows at the top of the signed-in pages. The expiration number and the max-downloads number are saved on this form. A newly filed document is still kept for 30 days, and it can still be downloaded 100 times. Changing the numbers does not change that yet. The switches for password protection, two-factor, and email notifications are saved when you choose Save changes. They do not add a download password, a second code at sign-in, or an email. Leave them as they are during setup. Do not tell a client those controls are protecting the file. Do not choose Delete Organization while you are setting up. That removes the firm and the files under it."),
    (20, "Segment 20 - Leave billing until you mean to pay", "16-billing.png", 30, "Choose Settings, then Billing, only when you mean to look at the plan. A new firm is on Trial. No card is on file. The date on this card is the example firm's date, not yours. Starter is 29 dollars a month for 3 people. Business is 149 dollars a month for 15 people. Enterprise is arranged from Contact us. Subscribe stays gray unless you are an Owner or an Admin. A gray button does not mean the trial has ended. You do not need a card to open the first matter."),
    (21, "Closing", "09-signature-requests.png", 25, "You are done when you can sign in, a matter has both names, a document is filed, Approvals shows it as approved, you sent the acceptance link yourself, the client sees the words Your acceptance is recorded, and anyone you invited shows Active rather than Pending. If a numbered step does not match your screen, email hello@securefileexchange.com with the step number. Do not book a call for a short password, a missing client name, a gray File button, or a link you have not copied yet."),
]


def format_timestamp(seconds):
    """Format time as HH:MM:SS.mmm"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int((seconds % 1) * 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d}.{millis:03d}"


def generate_metadata():
    """Generate video metadata JSON."""
    print("Generating metadata.json...")

    segments_data = []
    total_duration = 0

    for seg_id, name, image, duration, narration in SEGMENTS:
        segments_data.append({
            "id": seg_id,
            "name": name,
            "image": image,
            "duration_seconds": duration,
            "narration": narration,
            "audio_file": f"audio_assets/segment_{seg_id:02d}.mp3"
        })
        total_duration += duration

    metadata = {
        "project": "SFX for Legal - Onboarding Video",
        "version": "1.0.0",
        "created": datetime.now().isoformat(),
        "description": "Professional 15-minute setup tutorial for SFX for Legal",
        "specifications": {
            "resolution": "1920x1080",
            "fps": 30,
            "codec_video": "H.264 (libx264)",
            "codec_audio": "AAC",
            "format": "MP4",
            "total_duration_seconds": total_duration,
            "total_duration_minutes": int(total_duration / 60)
        },
        "branding": {
            "navy": "#1D2749",
            "cerulean": "#007599"
        },
        "segments": segments_data,
        "example_firm": "Northline Counsel",
        "support_email": "hello@securefileexchange.com"
    }

    output_file = OUTPUT_DIR / "video_metadata.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)

    print(f"  [OK] Saved: {output_file}")
    print(f"    Total duration: {int(total_duration / 60)}m {int(total_duration % 60)}s")
    return output_file


def generate_subtitles_vtt():
    """Generate VTT subtitle file."""
    print("Generating captions.vtt...")

    output_file = OUTPUT_DIR / "captions.vtt"

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("WEBVTT\n\n")

        current_time = 0

        for seg_id, name, image, duration, narration in SEGMENTS:
            end_time = current_time + duration

            # Format timestamps
            start_ts = format_timestamp(current_time)
            end_ts = format_timestamp(end_time)

            # Wrap narration to readable lines
            words = narration.split()
            lines = []
            current_line = []

            for word in words:
                current_line.append(word)
                line_text = ' '.join(current_line)
                if len(line_text) > 60:
                    lines.append(' '.join(current_line[:-1]))
                    current_line = [word]

            if current_line:
                lines.append(' '.join(current_line))

            # Limit to 3 lines per subtitle
            caption_text = '\n'.join(lines[:3])

            # Write subtitle entry
            f.write(f"{start_ts} --> {end_ts}\n")
            f.write(f"{caption_text}\n\n")

            current_time = end_time

    print(f"  [OK] Saved: {output_file}")
    return output_file


def generate_narration_list():
    """Generate plain text file with all narrations for TTS generation."""
    print("Generating narration list...")

    output_file = OUTPUT_DIR / "narration_for_tts.txt"

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("SFX for Legal Onboarding Video - Narration Script\n")
        f.write("=" * 70 + "\n\n")
        f.write("INSTRUCTIONS FOR TEXT-TO-SPEECH GENERATION:\n")
        f.write("Generate 22 MP3 files from the narrations below.\n")
        f.write("Save them as: audio_assets/segment_00.mp3 through segment_21.mp3\n")
        f.write("Duration guide: Each segment should be 20-40 seconds when spoken.\n\n")
        f.write("=" * 70 + "\n\n")

        for seg_id, name, image, duration, narration in SEGMENTS:
            f.write(f"\n[SEGMENT {seg_id:02d}] {name}\n")
            f.write(f"Duration: {duration} seconds | Image: {image}\n")
            f.write(f"Audio File: segment_{seg_id:02d}.mp3\n")
            f.write("-" * 70 + "\n")
            f.write(f"{narration}\n")
            f.write("-" * 70 + "\n")

    print(f"  [OK] Saved: {output_file}")
    return output_file


def generate_ffmpeg_concat_template():
    """Generate template for FFmpeg concatenation."""
    print("Generating FFmpeg assembly template...")

    output_file = OUTPUT_DIR / "assemble_video_template.sh"

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("#!/bin/bash\n")
        f.write("# SFX for Legal - Video Assembly Template\n")
        f.write("# This script requires:\n")
        f.write("# 1. FFmpeg installed (ffmpeg, ffprobe commands)\n")
        f.write("# 2. All screenshot images in figures/ folder\n")
        f.write("# 3. All 22 voiceover MP3s in audio_assets/ folder\n\n")

        f.write("set -e\n\n")

        f.write("SCRIPT_DIR=\"$(cd \"$(dirname \"${BASH_SOURCE[0]}\")\" && pwd)\"\n")
        f.write("OUTPUT_VIDEO=\"${SCRIPT_DIR}/SFX-for-Legal-setup-video.mp4\"\n")
        f.write("FIGURES_DIR=\"${SCRIPT_DIR}/figures\"\n")
        f.write("AUDIO_DIR=\"${SCRIPT_DIR}/audio_assets\"\n")
        f.write("TEMP_DIR=\"${SCRIPT_DIR}/.video_temp\"\n\n")

        f.write("mkdir -p \"$TEMP_DIR\"\n\n")

        f.write("echo '=========================================================='\n")
        f.write("echo 'SFX for Legal - Video Assembly'\n")
        f.write("echo '=========================================================='\n\n")

        f.write("CONCAT_FILE=\"$TEMP_DIR/concat.txt\"\n")
        f.write("> \"$CONCAT_FILE\"\n\n")

        # Generate segment assembly commands
        image_map = {}
        for seg_id, name, image, duration, narration in SEGMENTS:
            if image not in image_map:
                image_map[image] = []
            image_map[image].append((seg_id, name, duration))

        for seg_id, name, image, duration, narration in SEGMENTS:
            f.write(f"echo \"Creating segment {seg_id:02d}: {name}\"\n")
            f.write(f"ffmpeg -loop 1 \\\n")
            f.write(f"    -i \"$FIGURES_DIR/{image}\" \\\n")
            f.write(f"    -i \"$AUDIO_DIR/segment_{seg_id:02d}.mp3\" \\\n")
            f.write(f"    -t {duration} \\\n")
            f.write(f"    -vf \"scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black\" \\\n")
            f.write(f"    -pix_fmt yuv420p \\\n")
            f.write(f"    -c:v libx264 -preset veryfast \\\n")
            f.write(f"    -c:a aac \\\n")
            f.write(f"    -y \"$TEMP_DIR/segment_{seg_id:02d}.mp4\" 2>/dev/null\n\n")
            f.write(f"echo \"file '$TEMP_DIR/segment_{seg_id:02d}.mp4'\" >> \"$CONCAT_FILE\"\n\n")

        f.write("\necho 'Concatenating all segments...'\n")
        f.write("ffmpeg -f concat -safe 0 -i \"$CONCAT_FILE\" -c copy -y \"$OUTPUT_VIDEO\" 2>/dev/null\n\n")

        f.write("echo\n")
        f.write("echo '=========================================================='\n")
        f.write("echo 'Video assembly complete!'\n")
        f.write("ls -lh \"$OUTPUT_VIDEO\"\n")
        f.write("echo '=========================================================='\n")

    # Make executable
    import os
    os.chmod(output_file, 0o755)

    print(f"  [OK] Saved: {output_file}")
    return output_file


def main():
    """Generate all video components."""
    print("\n" + "=" * 70)
    print("SFX for Legal - Video Components Generator")
    print("=" * 70 + "\n")

    try:
        generate_metadata()
        generate_subtitles_vtt()
        generate_narration_list()
        generate_ffmpeg_concat_template()

        print("\n" + "=" * 70)
        print("SUCCESS!")
        print("=" * 70)
        print("\nGenerated files:")
        print("  [OK] video_metadata.json      - Project metadata")
        print("  [OK] captions.vtt              - Subtitle file for video")
        print("  [OK] narration_for_tts.txt    - All narrations for voice generation")
        print("  [OK] assemble_video_template.sh - FFmpeg assembly script")
        print("\nNEXT STEPS:")
        print("  1. Generate 22 voiceover MP3 files (segment_00.mp3 to segment_21.mp3)")
        print("  2. Place them in: audio_assets/ folder")
        print("  3. Install FFmpeg if not already installed")
        print("  4. Run: bash assemble_video_template.sh")
        print("\nFor detailed instructions, see: ONBOARDING_VIDEO_GUIDE.md")
        print("=" * 70 + "\n")

        return True

    except Exception as e:
        print(f"\nERROR: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
