#!/usr/bin/env python3
"""
SFX for Legal Onboarding Video Generator

Combines screenshots, AI voiceover, annotations, and captions
into a professional 15-minute setup video.
"""

import os
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json
from gtts import gTTS
from moviepy.editor import (
    ImageClip, AudioFileClip, TextClip, CompositeVideoClip,
    concatenate_videoclips, vfx
)
import subprocess
from datetime import timedelta

# Configuration
BRAND_NAVY = "#1D2749"
BRAND_CERULEAN = "#007599"
OUTPUT_PATH = Path("C:/Users/Admin/secure-file-exchange/docs/onboarding/SFX-for-Legal-setup-video.mp4")
FIGURES_PATH = Path("C:/Users/Admin/secure-file-exchange/docs/onboarding/figures")
TEMP_DIR = Path("C:/Users/Admin/AppData/Local/Temp/sfx_video_generation")

# Ensure temp directory
TEMP_DIR.mkdir(parents=True, exist_ok=True)

# Video settings
VIDEO_WIDTH = 1920
VIDEO_HEIGHT = 1080
FPS = 30

# Script segments
SEGMENTS = [
    {
        "name": "Opening",
        "image": "01-signup.png",
        "duration": 20,
        "text": "This is the setup for SFX for Legal. You will open a matter, file a document, have someone at the firm approve it, and then ask the client to type their name. The pictures use an example firm, Northline Counsel. Use your own names. Follow the steps in order.",
        "annotations": [
            {"text": "Example: Northline Counsel", "position": (100, 900), "color": BRAND_CERULEAN}
        ]
    },
    {
        "name": "Segment 1 - Create the firm account",
        "image": "01-signup.png",
        "duration": 30,
        "text": "From the front page, choose Open a matter. This screen is Get Started. Type the firm name, your email, and a password of at least 12 characters. Type the password again. Check the terms box. Then choose Create Account. The trial is 14 days. This screen does not ask for a card. Create Account does not open the firm until every field is valid. The next segment shows the three messages people miss.",
        "annotations": [
            {"text": "Minimum 12 characters", "position": (1400, 400), "color": BRAND_CERULEAN},
            {"text": "No credit card required", "position": (100, 900), "color": BRAND_CERULEAN}
        ]
    },
    {
        "name": "Segment 2 - The three checks people skip",
        "image": "02-signup-skipped.png",
        "duration": 30,
        "text": "If a check fails, the firm is not created. This picture shows three messages at once. The password must be at least 12 characters. The two passwords must match. You must agree to the terms and privacy policy. A short password and a mismatched confirmation are separate errors. Fix both, and check the box, then choose Create Account again. The firm name and the email are required too.",
        "annotations": [
            {"text": "All required fields", "position": (100, 900), "color": "#FF6B6B"},
            {"text": "Passwords must match", "position": (1400, 500), "color": "#FF6B6B"}
        ]
    },
    {
        "name": "Segment 3 - Sign in the next time",
        "image": "03-login.png",
        "duration": 30,
        "text": "The next time, choose Sign in. Use the same email and password, then choose Sign In. Remember me keeps you signed in on this browser. Forgot password does not send an email. The reset page says password reset is not available yet. Use the password from signup. A person who was invited cannot use this screen until they have opened their invite link.",
        "annotations": [
            {"text": "Forgot password: Not available yet", "position": (100, 900), "color": BRAND_NAVY}
        ]
    },
    {
        "name": "Segment 4 - Read the dashboard first",
        "image": "04-dashboard.png",
        "duration": 25,
        "text": "After sign-in you land on the dashboard. It counts open matters, documents waiting for approval, and documents filed this month. The counts in this picture belong to the example firm. Use the counts on your own screen. This is a summary. The waiting list itself is on Approvals, not in this number.",
        "annotations": [
            {"text": "Summary only", "position": (100, 900), "color": BRAND_CERULEAN},
            {"text": "Your actual counts shown here", "position": (900, 200), "color": BRAND_CERULEAN}
        ]
    },
    {
        "name": "Segment 5 - Open the matters list",
        "image": "05-matters.png",
        "duration": 20,
        "text": "In the left column, choose Matters. These are the cases, and the documents that belong to them. A new firm has an empty list and a button labeled Open matter. This example already has Hartwell acquisition. A document is filed on a matter. There is nowhere to put a client file before a matter exists.",
        "annotations": [
            {"text": "Matters contain documents", "position": (1400, 300), "color": BRAND_CERULEAN}
        ]
    },
    {
        "name": "Segment 6 - A matter needs both names",
        "image": "06-open-matter.png",
        "duration": 25,
        "text": "Choose Open matter. Two boxes appear: Matter, and Client. Both are required. The example uses Hartwell acquisition and Hartwell Holdings. Use the real matter and the real client. If either box is empty, the matter is not created.",
        "annotations": [
            {"text": "Both required", "position": (900, 200), "color": "#FF6B6B"},
            {"text": "Matter + Client", "position": (900, 300), "color": "#FF6B6B"}
        ]
    },
    {
        "name": "Segment 7 - File the document",
        "image": "07-matter-file.png",
        "duration": 30,
        "text": "Open the matter. Under Add a document, choose the file, then choose File on this matter. That button stays gray until a file is chosen. The screen refuses a file larger than 6 MB. Filing puts the document on the matter. It does not approve it, and it does not send it to anyone. People stop at the gray button. Choose the file first. The button turns solid after a file is chosen.",
        "annotations": [
            {"text": "Choose file first", "position": (100, 900), "color": BRAND_CERULEAN},
            {"text": "Filing ≠ Approval", "position": (1400, 200), "color": BRAND_CERULEAN},
            {"text": "Max 6 MB", "position": (100, 800), "color": BRAND_NAVY}
        ]
    },
    {
        "name": "Segment 8 - Ask someone at the firm to approve",
        "image": "07-matter-file.png",
        "duration": 25,
        "text": "On that document row, choose Request approval. That adds a waiting decision on Approvals. It does not email anyone, and it does not send the file to the client. Request approval and Copy acceptance link are different buttons. Leave the lower card alone until the document is approved.",
        "annotations": [
            {"text": "No email sent", "position": (900, 900), "color": "#FF6B6B"},
            {"text": "Request approval button", "position": (1400, 400), "color": BRAND_CERULEAN}
        ]
    },
    {
        "name": "Segment 9 - Approve it, or send it back",
        "image": "08-approvals.png",
        "duration": 35,
        "text": "Choose Approvals. A waiting document is marked pending, and it has Approve and Reject. Approve means someone at the firm has released it. Reject leaves it on the matter. It does not record client acceptance. A row that is already decided has no buttons. It cannot be changed from this screen. This picture shows the example file twice: one row still pending, and an older row already approved. Your list shows only the decisions your firm has made. Uploading the file did not approve it. A person chooses Approve or Reject here.",
        "annotations": [
            {"text": "Pending: Approve or Reject", "position": (100, 900), "color": BRAND_CERULEAN},
            {"text": "Approved: No buttons", "position": (1400, 300), "color": BRAND_NAVY}
        ]
    },
    {
        "name": "Segment 10 - Copy the acceptance link after approval",
        "image": "07-matter-file.png",
        "duration": 35,
        "text": "Go back to the matter. The lower card asks someone to accept a document. This records a typed name. It does not send the document to DocuSign. Choose the document. Type the signer name and the signer email. Both are required. Then choose Copy acceptance link. The link is copied. It is not mailed. The screen will let you copy a link even if Approvals does not say approved yet. Do not send it until it does. Paste the link into your own message.",
        "annotations": [
            {"text": "Not DocuSign", "position": (100, 900), "color": BRAND_CERULEAN},
            {"text": "Copy link (not email)", "position": (1400, 200), "color": BRAND_CERULEAN},
            {"text": "Both name & email required", "position": (900, 500), "color": "#FF6B6B"}
        ]
    },
    {
        "name": "Segment 11 - What the client sees",
        "image": "17-accept-document.png",
        "duration": 30,
        "text": "The client does not need an account. The page is titled Accept this document. It names your firm, the file, the matter, and the client. They type their name and choose Record acceptance. The page says this is not a DocuSign ceremony. A name shorter than two characters is refused. In this picture the name was filled in for the example, and the button was not pressed. The client still has to choose Record acceptance.",
        "annotations": [
            {"text": "No account needed", "position": (100, 900), "color": BRAND_CERULEAN},
            {"text": "Not a DocuSign ceremony", "position": (1400, 300), "color": BRAND_CERULEAN}
        ]
    },
    {
        "name": "Segment 12 - The client is finished when this sentence appears",
        "image": "18-acceptance-recorded.png",
        "duration": 25,
        "text": "After a real submission, the page says, Your acceptance is recorded. There is no separate signed PDF on this screen. The record is the typed name, the time, and the document they were shown. This picture is an example that was already recorded. Closing the tab before this sentence appears means it was not recorded. A second submission on a finished link is refused.",
        "annotations": [
            {"text": "\"Your acceptance is recorded\"", "position": (900, 900), "color": "#4CAF50"},
            {"text": "Completion confirmed", "position": (100, 800), "color": "#4CAF50"}
        ]
    },
    {
        "name": "Segment 13 - The firm sees the acceptance",
        "image": "09-signature-requests.png",
        "duration": 25,
        "text": "Choose Signature requests. A finished request is marked signed. The row names the document, the signer, the email you entered, the matter, the time, and the name they typed. The page says DocuSign is not connected. A link that has not been submitted stays unsigned. Copying the link does not make it signed.",
        "annotations": [
            {"text": "DocuSign not connected", "position": (100, 900), "color": BRAND_NAVY},
            {"text": "Signed status", "position": (1400, 300), "color": "#4CAF50"}
        ]
    },
    {
        "name": "Segment 14 - See who can enter the firm",
        "image": "11-team.png",
        "duration": 25,
        "text": "Choose Team and client access. The person who created the firm is the Owner, and cannot be removed on this page. An Admin can manage people and settings. A Member can work with the files. The names here are the example firm. Your list should contain only your people. A client who only needs to accept one document does not need a seat. Send them the acceptance link instead.",
        "annotations": [
            {"text": "Owner | Admin | Member", "position": (900, 900), "color": BRAND_CERULEAN},
            {"text": "Example firm only", "position": (100, 800), "color": BRAND_NAVY}
        ]
    },
    {
        "name": "Segment 15 - Invite a person",
        "image": "12-invite.png",
        "duration": 25,
        "text": "Choose Invite Member. Type their email. Choose Member or Admin. Then choose Send Invite. Member is for someone who should work on files. Admin is for someone who should manage people, settings, and the plan. You do not invite a second Owner. Send Invite only creates the invitation. It does not deliver a message. The next segment is the part people miss.",
        "annotations": [
            {"text": "Send Invite ≠ Email", "position": (100, 900), "color": "#FF6B6B"},
            {"text": "Creates invite only", "position": (1400, 300), "color": "#FF6B6B"}
        ]
    },
    {
        "name": "Segment 16 - No email is sent",
        "image": "13-invite-pending.png",
        "duration": 30,
        "text": "The green notice says no email is sent. Share the link yourself. Choose Copy link and paste it into your own message. Until that person opens the link and creates a password, the row stays Pending. A pending person cannot sign in. Pending does not mean an email is on the way. The link in this picture belongs to the example firm. Copy the link on your own screen. Do not type the address out of the picture.",
        "annotations": [
            {"text": "No email is sent", "position": (900, 900), "color": "#FF6B6B"},
            {"text": "Copy link yourself", "position": (100, 800), "color": BRAND_CERULEAN},
            {"text": "Pending = Can't sign in yet", "position": (1400, 200), "color": BRAND_NAVY}
        ]
    },
    {
        "name": "Segment 17 - They join by setting a password",
        "image": "14-accept-invite.png",
        "duration": 25,
        "text": "Their link opens Accept invitation. It names the firm and the email you invited. They type their name, a password of at least 12 characters, and the same password again. Then they choose Create account and join. If the password is short, or the two boxes differ, the account is not created. After they join, the row changes from Pending to Active, and they can sign in. This picture stops before the button is pressed. The password boxes stay empty.",
        "annotations": [
            {"text": "Minimum 12 characters", "position": (900, 900), "color": BRAND_CERULEAN},
            {"text": "Passwords must match", "position": (1400, 300), "color": BRAND_CERULEAN}
        ]
    },
    {
        "name": "Segment 18 - Keep the activity record",
        "image": "10-compliance.png",
        "duration": 25,
        "text": "Choose Compliance reports. The list shows who opened a matter, filed a document, requested approval, approved or rejected it, invited someone, and recorded an acceptance. The newest lines are at the top. This is the firm's activity record. It is not a certification, and it is not a legal opinion about the document. A missing line means that action was not recorded.",
        "annotations": [
            {"text": "Activity record only", "position": (100, 900), "color": BRAND_NAVY},
            {"text": "Not a certification", "position": (1400, 300), "color": BRAND_NAVY}
        ]
    },
    {
        "name": "Segment 19 - Settings, and the switches that are only saved",
        "image": "15-settings.png",
        "duration": 40,
        "text": "Choose Settings, then General. The organization name is saved, and it shows at the top of the signed-in pages. The expiration number and the max-downloads number are saved on this form. A newly filed document is still kept for 30 days, and it can still be downloaded 100 times. Changing the numbers does not change that yet. The switches for password protection, two-factor, and email notifications are saved when you choose Save changes. They do not add a download password, a second code at sign-in, or an email. Leave them as they are during setup. Do not tell a client those controls are protecting the file. Do not choose Delete Organization while you are setting up. That removes the firm and the files under it.",
        "annotations": [
            {"text": "Switches saved only", "position": (100, 900), "color": BRAND_NAVY},
            {"text": "Features not active yet", "position": (1400, 200), "color": BRAND_NAVY},
            {"text": "Don't delete during setup", "position": (900, 800), "color": "#FF6B6B"}
        ]
    },
    {
        "name": "Segment 20 - Leave billing until you mean to pay",
        "image": "16-billing.png",
        "duration": 30,
        "text": "Choose Settings, then Billing, only when you mean to look at the plan. A new firm is on Trial. No card is on file. The date on this card is the example firm's date, not yours. Starter is 29 dollars a month for 3 people. Business is 149 dollars a month for 15 people. Enterprise is arranged from Contact us. Subscribe stays gray unless you are an Owner or an Admin. A gray button does not mean the trial has ended. You do not need a card to open the first matter.",
        "annotations": [
            {"text": "No card on file", "position": (100, 900), "color": BRAND_CERULEAN},
            {"text": "Trial period", "position": (1400, 300), "color": BRAND_CERULEAN},
            {"text": "No card needed for setup", "position": (900, 800), "color": BRAND_CERULEAN}
        ]
    },
    {
        "name": "Closing",
        "image": "09-signature-requests.png",
        "duration": 25,
        "text": "You are done when you can sign in, a matter has both names, a document is filed, Approvals shows it as approved, you sent the acceptance link yourself, the client sees the words Your acceptance is recorded, and anyone you invited shows Active rather than Pending. If a numbered step does not match your screen, email hello@securefileexchange.com with the step number. Do not book a call for a short password, a missing client name, a gray File button, or a link you have not copied yet.",
        "annotations": [
            {"text": "Setup Checklist", "position": (900, 900), "color": BRAND_CERULEAN},
            {"text": "All steps complete?", "position": (100, 800), "color": BRAND_CERULEAN}
        ]
    }
]


def generate_voiceover(text, filename):
    """Generate voiceover audio using Google Text-to-Speech."""
    audio_path = TEMP_DIR / filename
    if audio_path.exists():
        return str(audio_path)

    try:
        print(f"Generating voiceover: {filename}...")
        tts = gTTS(text=text, lang='en', slow=False)
        tts.save(str(audio_path))
        return str(audio_path)
    except Exception as e:
        print(f"Error generating voiceover: {e}")
        return None


def add_watermark_and_annotations(image_path, segment_name, annotations, output_path):
    """Add branding, annotations, and text overlays to image."""
    try:
        img = Image.open(image_path)

        # Ensure image is RGB
        if img.mode != 'RGB':
            img = img.convert('RGB')

        # Resize to video dimensions if needed
        if img.size != (VIDEO_WIDTH, VIDEO_HEIGHT):
            img = img.resize((VIDEO_WIDTH, VIDEO_HEIGHT), Image.Resampling.LANCZOS)

        draw = ImageDraw.Draw(img, 'RGBA')

        # Try to load a nice font, fallback to default
        try:
            title_font = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 32)
            label_font = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 24)
            small_font = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 20)
        except:
            title_font = ImageFont.load_default()
            label_font = ImageFont.load_default()
            small_font = ImageFont.load_default()

        # Add subtle background bar at bottom for better text visibility
        draw.rectangle(
            [(0, VIDEO_HEIGHT - 120), (VIDEO_WIDTH, VIDEO_HEIGHT)],
            fill=(29, 39, 73, 220)  # Navy with transparency
        )

        # Add segment name
        segment_text = segment_name.split(" - ")[-1] if " - " in segment_name else segment_name
        draw.text(
            (50, VIDEO_HEIGHT - 100),
            segment_text,
            font=label_font,
            fill=(255, 255, 255, 255)
        )

        # Add annotations with arrows/highlights
        for annotation in annotations:
            text = annotation.get("text", "")
            position = annotation.get("position", (100, 100))
            color_hex = annotation.get("color", BRAND_CERULEAN)

            # Convert hex to RGB tuple
            color_rgb = tuple(int(color_hex.lstrip('#')[i:i+2], 16) for i in (0, 2, 4))
            color_rgba = color_rgb + (255,)

            # Draw text with background box
            bbox = draw.textbbox(position, text, font=small_font)
            padding = 8

            # Background box
            draw.rectangle(
                [
                    (bbox[0] - padding, bbox[1] - padding),
                    (bbox[2] + padding, bbox[3] + padding)
                ],
                fill=(255, 255, 255, 240),
                outline=color_rgb + (255,),
                width=2
            )

            # Text
            draw.text(position, text, font=small_font, fill=color_rgb + (255,))

        # Add branding watermark in corner
        draw.text(
            (VIDEO_WIDTH - 280, 20),
            "SFX for Legal Setup",
            font=small_font,
            fill=(0, 117, 153, 200)  # Cerulean with transparency
        )

        img.save(output_path)
        return output_path
    except Exception as e:
        print(f"Error adding annotations to {image_path}: {e}")
        return image_path


def create_segment_video(segment_index, segment):
    """Create a single segment video with audio, image, and annotations."""
    print(f"\nCreating segment {segment_index + 1}: {segment['name']}...")

    # Load image
    image_path = FIGURES_PATH / segment['image']
    if not image_path.exists():
        print(f"Warning: Image not found: {image_path}")
        # Create placeholder
        img = Image.new('RGB', (VIDEO_WIDTH, VIDEO_HEIGHT), color=(200, 200, 200))
        image_path = TEMP_DIR / f"placeholder_{segment_index}.png"
        img.save(image_path)

    # Add annotations to image
    annotated_image = TEMP_DIR / f"annotated_{segment_index}.png"
    add_watermark_and_annotations(
        str(image_path),
        segment['name'],
        segment.get('annotations', []),
        str(annotated_image)
    )

    # Generate voiceover
    audio_path = generate_voiceover(
        segment['text'],
        f"voiceover_{segment_index}.mp3"
    )

    if not audio_path:
        print(f"Warning: Could not generate voiceover for segment {segment_index}")
        # Create placeholder audio with silence
        import wave
        silence_path = TEMP_DIR / f"silence_{segment_index}.wav"
        duration = segment.get('duration', 30)
        sample_rate = 44100
        num_samples = duration * sample_rate

        with wave.open(str(silence_path), 'w') as wav_file:
            wav_file.setnchannels(1)
            wav_file.setsampwidth(2)
            wav_file.setframerate(sample_rate)
            wav_file.writeframes(b'\x00' * (num_samples * 2))
        audio_path = str(silence_path)

    # Create video clip from image
    audio_clip = AudioFileClip(audio_path)
    actual_duration = min(audio_clip.duration, segment.get('duration', 40))

    image_clip = ImageClip(str(annotated_image)).set_duration(actual_duration)

    # Add captions (subtitles)
    caption_text = segment['text']
    # Create text clip for captions
    txt_clip = TextClip(
        caption_text,
        fontsize=28,
        color='white',
        bg_color=BRAND_NAVY,
        font='Arial',
        method='caption',
        size=(VIDEO_WIDTH - 100, None),
        align='center'
    ).set_duration(actual_duration).set_position(('center', VIDEO_HEIGHT - 150))

    # Composite video with image and captions
    video = CompositeVideoClip([image_clip, txt_clip]).set_audio(audio_clip)

    return video


def main():
    """Generate the complete onboarding video."""
    print("="*60)
    print("SFX for Legal - Professional Onboarding Video Generator")
    print("="*60)

    # Create all segment videos
    videos = []

    for i, segment in enumerate(SEGMENTS):
        try:
            video = create_segment_video(i, segment)
            videos.append(video)
        except Exception as e:
            print(f"Error creating segment {i}: {e}")
            import traceback
            traceback.print_exc()

    if not videos:
        print("ERROR: Could not create any video segments!")
        return False

    print("\n" + "="*60)
    print(f"Combining {len(videos)} segments into final video...")
    print("="*60)

    try:
        # Concatenate all videos
        final_video = concatenate_videoclips(videos)

        # Add smooth transitions
        final_video = final_video.speedx(1)  # Normal speed

        # Write output file
        print(f"\nWriting video to: {OUTPUT_PATH}")
        OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

        final_video.write_videofile(
            str(OUTPUT_PATH),
            fps=FPS,
            codec='libx264',
            audio_codec='aac',
            verbose=False,
            logger=None
        )

        print("\n" + "="*60)
        print("SUCCESS!")
        print("="*60)
        print(f"Video saved to: {OUTPUT_PATH}")

        # Calculate and display video info
        duration = final_video.duration
        minutes = int(duration // 60)
        seconds = int(duration % 60)
        print(f"Total duration: {minutes} minutes {seconds} seconds")
        print(f"File size: {OUTPUT_PATH.stat().st_size / (1024*1024):.1f} MB")
        print("\nVideo is ready for use!")
        return True

    except Exception as e:
        print(f"\nERROR during video compilation: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
