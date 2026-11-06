#!/usr/bin/env python3
"""
SFX for Legal Onboarding Video Generator (Simplified)
Uses ffmpeg directly for video composition.
"""

import os
import json
import subprocess
from pathlib import Path
from gtts import gTTS
import time

SCRIPT_DIR = Path(__file__).parent
OUTPUT_PATH = SCRIPT_DIR / "SFX-for-Legal-setup-video.mp4"
FIGURES_PATH = SCRIPT_DIR / "figures"
TEMP_DIR = SCRIPT_DIR / ".temp_video"
TEMP_DIR.mkdir(exist_ok=True)

# Video settings
VIDEO_WIDTH = 1920
VIDEO_HEIGHT = 1080
FPS = 30

SEGMENTS = [
    ("Opening", "01-signup.png", 20, "This is the setup for SFX for Legal. You will open a matter, file a document, have someone at the firm approve it, and then ask the client to type their name. The pictures use an example firm, Northline Counsel. Use your own names. Follow the steps in order."),
    ("Segment 1", "01-signup.png", 30, "From the front page, choose Open a matter. This screen is Get Started. Type the firm name, your email, and a password of at least 12 characters. Type the password again. Check the terms box. Then choose Create Account. The trial is 14 days. This screen does not ask for a card. Create Account does not open the firm until every field is valid. The next segment shows the three messages people miss."),
    ("Segment 2", "02-signup-skipped.png", 30, "If a check fails, the firm is not created. This picture shows three messages at once. The password must be at least 12 characters. The two passwords must match. You must agree to the terms and privacy policy. A short password and a mismatched confirmation are separate errors. Fix both, and check the box, then choose Create Account again. The firm name and the email are required too."),
    ("Segment 3", "03-login.png", 30, "The next time, choose Sign in. Use the same email and password, then choose Sign In. Remember me keeps you signed in on this browser. Forgot password does not send an email. The reset page says password reset is not available yet. Use the password from signup. A person who was invited cannot use this screen until they have opened their invite link."),
    ("Segment 4", "04-dashboard.png", 25, "After sign-in you land on the dashboard. It counts open matters, documents waiting for approval, and documents filed this month. The counts in this picture belong to the example firm. Use the counts on your own screen. This is a summary. The waiting list itself is on Approvals, not in this number."),
    ("Segment 5", "05-matters.png", 20, "In the left column, choose Matters. These are the cases, and the documents that belong to them. A new firm has an empty list and a button labeled Open matter. This example already has Hartwell acquisition. A document is filed on a matter. There is nowhere to put a client file before a matter exists."),
    ("Segment 6", "06-open-matter.png", 25, "Choose Open matter. Two boxes appear: Matter, and Client. Both are required. The example uses Hartwell acquisition and Hartwell Holdings. Use the real matter and the real client. If either box is empty, the matter is not created."),
    ("Segment 7", "07-matter-file.png", 30, "Open the matter. Under Add a document, choose the file, then choose File on this matter. That button stays gray until a file is chosen. The screen refuses a file larger than 6 MB. Filing puts the document on the matter. It does not approve it, and it does not send it to anyone. People stop at the gray button. Choose the file first. The button turns solid after a file is chosen."),
    ("Segment 8", "07-matter-file.png", 25, "On that document row, choose Request approval. That adds a waiting decision on Approvals. It does not email anyone, and it does not send the file to the client. Request approval and Copy acceptance link are different buttons. Leave the lower card alone until the document is approved."),
    ("Segment 9", "08-approvals.png", 35, "Choose Approvals. A waiting document is marked pending, and it has Approve and Reject. Approve means someone at the firm has released it. Reject leaves it on the matter. It does not record client acceptance. A row that is already decided has no buttons. It cannot be changed from this screen. This picture shows the example file twice: one row still pending, and an older row already approved. Your list shows only the decisions your firm has made. Uploading the file did not approve it. A person chooses Approve or Reject here."),
    ("Segment 10", "07-matter-file.png", 35, "Go back to the matter. The lower card asks someone to accept a document. This records a typed name. It does not send the document to DocuSign. Choose the document. Type the signer name and the signer email. Both are required. Then choose Copy acceptance link. The link is copied. It is not mailed. The screen will let you copy a link even if Approvals does not say approved yet. Do not send it until it does. Paste the link into your own message."),
    ("Segment 11", "17-accept-document.png", 30, "The client does not need an account. The page is titled Accept this document. It names your firm, the file, the matter, and the client. They type their name and choose Record acceptance. The page says this is not a DocuSign ceremony. A name shorter than two characters is refused. In this picture the name was filled in for the example, and the button was not pressed. The client still has to choose Record acceptance."),
    ("Segment 12", "18-acceptance-recorded.png", 25, "After a real submission, the page says, Your acceptance is recorded. There is no separate signed PDF on this screen. The record is the typed name, the time, and the document they were shown. This picture is an example that was already recorded. Closing the tab before this sentence appears means it was not recorded. A second submission on a finished link is refused."),
    ("Segment 13", "09-signature-requests.png", 25, "Choose Signature requests. A finished request is marked signed. The row names the document, the signer, the email you entered, the matter, the time, and the name they typed. The page says DocuSign is not connected. A link that has not been submitted stays unsigned. Copying the link does not make it signed."),
    ("Segment 14", "11-team.png", 25, "Choose Team and client access. The person who created the firm is the Owner, and cannot be removed on this page. An Admin can manage people and settings. A Member can work with the files. The names here are the example firm. Your list should contain only your people. A client who only needs to accept one document does not need a seat. Send them the acceptance link instead."),
    ("Segment 15", "12-invite.png", 25, "Choose Invite Member. Type their email. Choose Member or Admin. Then choose Send Invite. Member is for someone who should work on files. Admin is for someone who should manage people, settings, and the plan. You do not invite a second Owner. Send Invite only creates the invitation. It does not deliver a message. The next segment is the part people miss."),
    ("Segment 16", "13-invite-pending.png", 30, "The green notice says no email is sent. Share the link yourself. Choose Copy link and paste it into your own message. Until that person opens the link and creates a password, the row stays Pending. A pending person cannot sign in. Pending does not mean an email is on the way. The link in this picture belongs to the example firm. Copy the link on your own screen. Do not type the address out of the picture."),
    ("Segment 17", "14-accept-invite.png", 25, "Their link opens Accept invitation. It names the firm and the email you invited. They type their name, a password of at least 12 characters, and the same password again. Then they choose Create account and join. If the password is short, or the two boxes differ, the account is not created. After they join, the row changes from Pending to Active, and they can sign in. This picture stops before the button is pressed. The password boxes stay empty."),
    ("Segment 18", "10-compliance.png", 25, "Choose Compliance reports. The list shows who opened a matter, filed a document, requested approval, approved or rejected it, invited someone, and recorded an acceptance. The newest lines are at the top. This is the firm's activity record. It is not a certification, and it is not a legal opinion about the document. A missing line means that action was not recorded."),
    ("Segment 19", "15-settings.png", 40, "Choose Settings, then General. The organization name is saved, and it shows at the top of the signed-in pages. The expiration number and the max-downloads number are saved on this form. A newly filed document is still kept for 30 days, and it can still be downloaded 100 times. Changing the numbers does not change that yet. The switches for password protection, two-factor, and email notifications are saved when you choose Save changes. They do not add a download password, a second code at sign-in, or an email. Leave them as they are during setup. Do not tell a client those controls are protecting the file. Do not choose Delete Organization while you are setting up. That removes the firm and the files under it."),
    ("Segment 20", "16-billing.png", 30, "Choose Settings, then Billing, only when you mean to look at the plan. A new firm is on Trial. No card is on file. The date on this card is the example firm's date, not yours. Starter is 29 dollars a month for 3 people. Business is 149 dollars a month for 15 people. Enterprise is arranged from Contact us. Subscribe stays gray unless you are an Owner or an Admin. A gray button does not mean the trial has ended. You do not need a card to open the first matter."),
    ("Closing", "09-signature-requests.png", 25, "You are done when you can sign in, a matter has both names, a document is filed, Approvals shows it as approved, you sent the acceptance link yourself, the client sees the words Your acceptance is recorded, and anyone you invited shows Active rather than Pending. If a numbered step does not match your screen, email hello@securefileexchange.com with the step number. Do not book a call for a short password, a missing client name, a gray File button, or a link you have not copied yet."),
]


def generate_voiceover(text, segment_index):
    """Generate voiceover using gTTS."""
    audio_path = TEMP_DIR / f"voiceover_{segment_index:02d}.mp3"

    if audio_path.exists():
        print(f"  Using cached voiceover {segment_index}")
        return str(audio_path)

    try:
        print(f"  Generating voiceover for segment {segment_index}...")
        tts = gTTS(text=text, lang='en', slow=False)
        tts.save(str(audio_path))
        print(f"  Saved: {audio_path.name}")
        return str(audio_path)
    except Exception as e:
        print(f"  Error: {e}")
        return None


def create_caption_file(segments):
    """Create VTT subtitle file."""
    vtt_path = TEMP_DIR / "captions.vtt"

    with open(vtt_path, 'w', encoding='utf-8') as f:
        f.write("WEBVTT\n\n")

        current_time = 0
        for i, (name, img, duration, text) in enumerate(segments):
            # Convert time to VTT format (HH:MM:SS.mmm)
            start_h = current_time // 3600
            start_m = (current_time % 3600) // 60
            start_s = current_time % 60

            end_time = current_time + duration
            end_h = end_time // 3600
            end_m = (end_time % 3600) // 60
            end_s = end_time % 60

            start_str = f"{int(start_h):02d}:{int(start_m):02d}:{int(start_s):06.3f}"
            end_str = f"{int(end_h):02d}:{int(end_m):02d}:{int(end_s):06.3f}"

            # Wrap text for better readability
            words = text.split()
            lines = []
            current_line = []
            for word in words:
                current_line.append(word)
                if len(' '.join(current_line)) > 60:
                    lines.append(' '.join(current_line[:-1]))
                    current_line = [word]
            if current_line:
                lines.append(' '.join(current_line))

            wrapped_text = '\n'.join(lines[:3])  # Limit to 3 lines

            f.write(f"{start_str} --> {end_str}\n")
            f.write(f"{wrapped_text}\n\n")

            current_time = end_time

    return str(vtt_path)


def scale_image_to_1080p(image_path, output_path):
    """Scale image to 1920x1080 using ffmpeg."""
    cmd = [
        'ffmpeg', '-i', str(image_path),
        '-vf', f'scale={VIDEO_WIDTH}:{VIDEO_HEIGHT}:force_original_aspect_ratio=decrease,pad={VIDEO_WIDTH}:{VIDEO_HEIGHT}:(ow-iw)/2:(oh-ih)/2:black',
        '-y', str(output_path)
    ]
    try:
        subprocess.run(cmd, capture_output=True, check=True, timeout=30)
        return str(output_path)
    except Exception as e:
        print(f"    Error scaling image: {e}")
        return None


def create_video_segment(segment_index, name, image_file, duration, text):
    """Create a single video segment using ffmpeg."""
    print(f"\nSegment {segment_index + 1}: {name}")

    # Check image exists
    image_path = FIGURES_PATH / image_file
    if not image_path.exists():
        print(f"  Warning: Image not found: {image_path}")
        return None

    # Scale image
    scaled_image = TEMP_DIR / f"image_{segment_index:02d}.png"
    print(f"  Scaling image...")
    if not scale_image_to_1080p(str(image_path), str(scaled_image)):
        return None

    # Generate voiceover
    audio_path = generate_voiceover(text, segment_index)
    if not audio_path:
        print(f"  Skipping segment due to voiceover error")
        return None

    # Get actual audio duration
    try:
        result = subprocess.run(
            ['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1:noprint_wrappers=1', str(audio_path)],
            capture_output=True, text=True, timeout=10
        )
        audio_duration = float(result.stdout.strip())
        # Use the shorter of audio duration or specified duration
        final_duration = min(audio_duration, duration)
    except:
        final_duration = duration

    # Create video segment using ffmpeg
    output_segment = TEMP_DIR / f"segment_{segment_index:02d}.mp4"

    # Create a more complex ffmpeg command with text overlay
    cmd = [
        'ffmpeg',
        '-loop', '1',
        '-i', str(scaled_image),
        '-i', str(audio_path),
        '-t', str(final_duration),
        '-vf', f"drawtext=text='SFX for Legal Setup':fontsize=32:fontcolor=white:x=(w-text_w)/2:y=h-60:box=1:boxcolor=black@0.5",
        '-pix_fmt', 'yuv420p',
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-y',
        str(output_segment)
    ]

    try:
        print(f"  Creating segment video...")
        subprocess.run(cmd, capture_output=True, check=True, timeout=60)
        print(f"  Segment created: {output_segment.name}")
        return str(output_segment)
    except subprocess.TimeoutExpired:
        print(f"  Timeout creating segment")
        return None
    except Exception as e:
        print(f"  Error: {e}")
        return None


def concatenate_videos(segment_paths):
    """Concatenate all video segments into final video."""
    print("\n" + "="*60)
    print("Concatenating video segments...")
    print("="*60)

    # Create concat file
    concat_file = TEMP_DIR / "concat.txt"
    with open(concat_file, 'w') as f:
        for seg_path in segment_paths:
            f.write(f"file '{seg_path}'\n")

    # Concatenate using ffmpeg
    output_video = TEMP_DIR / "concatenated.mp4"
    cmd = [
        'ffmpeg',
        '-f', 'concat',
        '-safe', '0',
        '-i', str(concat_file),
        '-c', 'copy',
        '-y',
        str(output_video)
    ]

    try:
        print("Running ffmpeg concatenation...")
        subprocess.run(cmd, capture_output=True, check=True, timeout=300)
        print(f"Concatenation complete: {output_video}")
        return str(output_video)
    except Exception as e:
        print(f"Error concatenating: {e}")
        return None


def main():
    """Generate the complete video."""
    print("\n" + "="*60)
    print("SFX for Legal - Onboarding Video Generator")
    print("="*60)

    # Create all segment videos
    segment_paths = []

    for i, (name, image, duration, text) in enumerate(SEGMENTS):
        seg_path = create_video_segment(i, name, image, duration, text)
        if seg_path:
            segment_paths.append(seg_path)

    if not segment_paths:
        print("\nERROR: No segments created!")
        return False

    print(f"\nSuccessfully created {len(segment_paths)} segments")

    # Create captions file
    print("\nGenerating captions file...")
    create_caption_file(SEGMENTS)

    # Concatenate all segments
    final_video_path = concatenate_videos(segment_paths)

    if not final_video_path:
        print("\nERROR: Failed to concatenate videos")
        return False

    # Copy to final location
    print(f"\nCopying to final location...")
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    import shutil
    shutil.copy(final_video_path, OUTPUT_PATH)

    # Get file info
    file_size_mb = OUTPUT_PATH.stat().st_size / (1024 * 1024)

    print("\n" + "="*60)
    print("SUCCESS!")
    print("="*60)
    print(f"Video saved to: {OUTPUT_PATH}")
    print(f"File size: {file_size_mb:.1f} MB")
    print(f"Total segments: {len(segment_paths)}")
    print("\nYour onboarding video is ready!")
    return True


if __name__ == "__main__":
    import sys
    success = main()
    sys.exit(0 if success else 1)
