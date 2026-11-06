#!/bin/bash
# SFX for Legal Onboarding Video Generator
# Creates a professional 15-minute setup video using ffmpeg and gTTS

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_VIDEO="${SCRIPT_DIR}/SFX-for-Legal-setup-video.mp4"
FIGURES_DIR="${SCRIPT_DIR}/figures"
TEMP_DIR="${SCRIPT_DIR}/.video_temp"
mkdir -p "$TEMP_DIR"

echo "============================================================"
echo "SFX for Legal - Onboarding Video Generator"
echo "============================================================"

# Define segments: name,image,duration,narration
declare -a SEGMENTS=(
    "Opening|01-signup.png|20|This is the setup for SFX for Legal. You will open a matter, file a document, have someone at the firm approve it, and then ask the client to type their name. The pictures use an example firm, Northline Counsel. Use your own names. Follow the steps in order."
    "Segment 1|01-signup.png|30|From the front page, choose Open a matter. This screen is Get Started. Type the firm name, your email, and a password of at least 12 characters. Type the password again. Check the terms box. Then choose Create Account. The trial is 14 days. This screen does not ask for a card. Create Account does not open the firm until every field is valid. The next segment shows the three messages people miss."
    "Segment 2|02-signup-skipped.png|30|If a check fails, the firm is not created. This picture shows three messages at once. The password must be at least 12 characters. The two passwords must match. You must agree to the terms and privacy policy. A short password and a mismatched confirmation are separate errors. Fix both, and check the box, then choose Create Account again. The firm name and the email are required too."
    "Segment 3|03-login.png|30|The next time, choose Sign in. Use the same email and password, then choose Sign In. Remember me keeps you signed in on this browser. Forgot password does not send an email. The reset page says password reset is not available yet. Use the password from signup. A person who was invited cannot use this screen until they have opened their invite link."
    "Segment 4|04-dashboard.png|25|After sign-in you land on the dashboard. It counts open matters, documents waiting for approval, and documents filed this month. The counts in this picture belong to the example firm. Use the counts on your own screen. This is a summary. The waiting list itself is on Approvals, not in this number."
    "Segment 5|05-matters.png|20|In the left column, choose Matters. These are the cases, and the documents that belong to them. A new firm has an empty list and a button labeled Open matter. This example already has Hartwell acquisition. A document is filed on a matter. There is nowhere to put a client file before a matter exists."
    "Segment 6|06-open-matter.png|25|Choose Open matter. Two boxes appear: Matter, and Client. Both are required. The example uses Hartwell acquisition and Hartwell Holdings. Use the real matter and the real client. If either box is empty, the matter is not created."
    "Segment 7|07-matter-file.png|30|Open the matter. Under Add a document, choose the file, then choose File on this matter. That button stays gray until a file is chosen. The screen refuses a file larger than 6 MB. Filing puts the document on the matter. It does not approve it, and it does not send it to anyone. People stop at the gray button. Choose the file first. The button turns solid after a file is chosen."
    "Segment 8|07-matter-file.png|25|On that document row, choose Request approval. That adds a waiting decision on Approvals. It does not email anyone, and it does not send the file to the client. Request approval and Copy acceptance link are different buttons. Leave the lower card alone until the document is approved."
    "Segment 9|08-approvals.png|35|Choose Approvals. A waiting document is marked pending, and it has Approve and Reject. Approve means someone at the firm has released it. Reject leaves it on the matter. It does not record client acceptance. A row that is already decided has no buttons. It cannot be changed from this screen. This picture shows the example file twice: one row still pending, and an older row already approved. Your list shows only the decisions your firm has made. Uploading the file did not approve it. A person chooses Approve or Reject here."
    "Segment 10|07-matter-file.png|35|Go back to the matter. The lower card asks someone to accept a document. This records a typed name. It does not send the document to DocuSign. Choose the document. Type the signer name and the signer email. Both are required. Then choose Copy acceptance link. The link is copied. It is not mailed. The screen will let you copy a link even if Approvals does not say approved yet. Do not send it until it does. Paste the link into your own message."
    "Segment 11|17-accept-document.png|30|The client does not need an account. The page is titled Accept this document. It names your firm, the file, the matter, and the client. They type their name and choose Record acceptance. The page says this is not a DocuSign ceremony. A name shorter than two characters is refused. In this picture the name was filled in for the example, and the button was not pressed. The client still has to choose Record acceptance."
    "Segment 12|18-acceptance-recorded.png|25|After a real submission, the page says, Your acceptance is recorded. There is no separate signed PDF on this screen. The record is the typed name, the time, and the document they were shown. This picture is an example that was already recorded. Closing the tab before this sentence appears means it was not recorded. A second submission on a finished link is refused."
    "Segment 13|09-signature-requests.png|25|Choose Signature requests. A finished request is marked signed. The row names the document, the signer, the email you entered, the matter, the time, and the name they typed. The page says DocuSign is not connected. A link that has not been submitted stays unsigned. Copying the link does not make it signed."
    "Segment 14|11-team.png|25|Choose Team and client access. The person who created the firm is the Owner, and cannot be removed on this page. An Admin can manage people and settings. A Member can work with the files. The names here are the example firm. Your list should contain only your people. A client who only needs to accept one document does not need a seat. Send them the acceptance link instead."
    "Segment 15|12-invite.png|25|Choose Invite Member. Type their email. Choose Member or Admin. Then choose Send Invite. Member is for someone who should work on files. Admin is for someone who should manage people, settings, and the plan. You do not invite a second Owner. Send Invite only creates the invitation. It does not deliver a message. The next segment is the part people miss."
    "Segment 16|13-invite-pending.png|30|The green notice says no email is sent. Share the link yourself. Choose Copy link and paste it into your own message. Until that person opens the link and creates a password, the row stays Pending. A pending person cannot sign in. Pending does not mean an email is on the way. The link in this picture belongs to the example firm. Copy the link on your own screen. Do not type the address out of the picture."
    "Segment 17|14-accept-invite.png|25|Their link opens Accept invitation. It names the firm and the email you invited. They type their name, a password of at least 12 characters, and the same password again. Then they choose Create account and join. If the password is short, or the two boxes differ, the account is not created. After they join, the row changes from Pending to Active, and they can sign in. This picture stops before the button is pressed. The password boxes stay empty."
    "Segment 18|10-compliance.png|25|Choose Compliance reports. The list shows who opened a matter, filed a document, requested approval, approved or rejected it, invited someone, and recorded an acceptance. The newest lines are at the top. This is the firm's activity record. It is not a certification, and it is not a legal opinion about the document. A missing line means that action was not recorded."
    "Segment 19|15-settings.png|40|Choose Settings, then General. The organization name is saved, and it shows at the top of the signed-in pages. The expiration number and the max-downloads number are saved on this form. A newly filed document is still kept for 30 days, and it can still be downloaded 100 times. Changing the numbers does not change that yet. The switches for password protection, two-factor, and email notifications are saved when you choose Save changes. They do not add a download password, a second code at sign-in, or an email. Leave them as they are during setup. Do not tell a client those controls are protecting the file. Do not choose Delete Organization while you are setting up. That removes the firm and the files under it."
    "Segment 20|16-billing.png|30|Choose Settings, then Billing, only when you mean to look at the plan. A new firm is on Trial. No card is on file. The date on this card is the example firm's date, not yours. Starter is 29 dollars a month for 3 people. Business is 149 dollars a month for 15 people. Enterprise is arranged from Contact us. Subscribe stays gray unless you are an Owner or an Admin. A gray button does not mean the trial has ended. You do not need a card to open the first matter."
    "Closing|09-signature-requests.png|25|You are done when you can sign in, a matter has both names, a document is filed, Approvals shows it as approved, you sent the acceptance link yourself, the client sees the words Your acceptance is recorded, and anyone you invited shows Active rather than Pending. If a numbered step does not match your screen, email hello@securefileexchange.com with the step number. Do not book a call for a short password, a missing client name, a gray File button, or a link you have not copied yet."
)

echo
echo "Generating voiceovers and creating segments..."
echo

CONCAT_FILE="$TEMP_DIR/concat.txt"
> "$CONCAT_FILE"  # Clear concat file

SEG_NUM=0
for segment in "${SEGMENTS[@]}"; do
    IFS='|' read -r NAME IMAGE DURATION NARRATION <<< "$segment"

    SEG_NUM=$((SEG_NUM + 1))
    printf "%02d" $SEG_NUM > /dev/null  # For zero-padding
    PAD_NUM=$(printf "%02d" $SEG_NUM)

    echo "[$SEG_NUM/22] Processing: $NAME"

    # Check image exists
    IMAGE_PATH="${FIGURES_DIR}/${IMAGE}"
    if [ ! -f "$IMAGE_PATH" ]; then
        echo "  ERROR: Image not found: $IMAGE_PATH"
        exit 1
    fi

    # Generate voiceover
    AUDIO_FILE="$TEMP_DIR/audio_${PAD_NUM}.mp3"
    if [ ! -f "$AUDIO_FILE" ]; then
        echo "  Generating voiceover..."
        python3 -c "from gtts import gTTS; gTTS('$NARRATION', lang='en').save('$AUDIO_FILE')" 2>/dev/null || true
    fi

    if [ ! -f "$AUDIO_FILE" ]; then
        echo "  ERROR: Could not generate audio"
        exit 1
    fi

    # Get audio duration
    AUDIO_DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$AUDIO_FILE" 2>/dev/null || echo "$DURATION")
    FINAL_DURATION=$(echo "if ($AUDIO_DURATION < $DURATION) $AUDIO_DURATION else $DURATION" | bc)

    # Scale image and create segment
    SEGMENT_FILE="$TEMP_DIR/segment_${PAD_NUM}.mp4"
    echo "  Creating video segment..."

    ffmpeg -loop 1 \
        -i "$IMAGE_PATH" \
        -i "$AUDIO_FILE" \
        -t "$FINAL_DURATION" \
        -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black" \
        -pix_fmt yuv420p \
        -c:v libx264 -preset veryfast \
        -c:a aac \
        -y "$SEGMENT_FILE" \
        2>/dev/null

    echo "  $NAME: ${FINAL_DURATION}s"
    echo "file '$SEGMENT_FILE'" >> "$CONCAT_FILE"
done

echo
echo "============================================================"
echo "Concatenating all segments..."
echo "============================================================"

# Concatenate all segments
ffmpeg -f concat -safe 0 -i "$CONCAT_FILE" -c copy -y "$OUTPUT_VIDEO" 2>/dev/null

echo
echo "============================================================"
echo "SUCCESS!"
echo "============================================================"
echo "Video: $OUTPUT_VIDEO"
FILE_SIZE=$(ls -lh "$OUTPUT_VIDEO" | awk '{print $5}')
echo "Size: $FILE_SIZE"
echo
echo "Your SFX for Legal onboarding video is ready!"
echo "============================================================"
