Alright, here's a comprehensive README for your "Automated Music Mix Timeline Creator" ExtendScript, designed for someone new to ExtendScripts but familiar with Premiere Pro.

---

# Automated Music Mix Timeline Creator for Adobe Premiere Pro

This ExtendScript for Adobe Premiere Pro automates the creation of a music mix video timeline. It's designed to take a collection of numbered audio files, a background image, and optional numbered thumbnail images, then arrange them on a Premiere Pro timeline with synchronized text graphics (using either Essential Graphics or Legacy Titles).

No more dragging and dropping dozens of clips and manually creating titles! This script streamlines your workflow for creating continuous music mixes.

## Table of Contents

1.  [What is an ExtendScript?](#what-is-an-extendscript)
2.  [Features](#features)
3.  [Requirements](#requirements)
4.  [Setup & Installation](#setup--installation)
    *   [Step 1: Save the Script](#step-1-save-the-script)
    *   [Step 2: Place Your Media Files](#step-2-place-your-media-files)
    *   [Step 3: Update the Script's Default Path (Optional but Recommended)](#step-3-update-the-scripts-default-path-optional-but-recommended)
    *   [Step 4: Essential Graphics Template (.MOGRT) Setup (Optional)](#step-4-essential-graphics-template-mogrt-setup-optional)
        *   [What is a .MOGRT?](#what-is-a-mogrt)
        *   [Creating Your Own .MOGRT](#creating-your-own-mogrt)
        *   [Finding Your .MOGRT Path](#finding-your-mogrt-path)
5.  [Usage](#usage)
    *   [Step 1: Open Premiere Pro](#step-1-open-premiere-pro)
    *   [Step 2: Run the Script](#step-2-run-the-script)
    *   [Step 3: Interacting with the ScriptUI](#step-3-interacting-with-the-scriptui)
    *   [Step 4: After the Script Runs](#step-4-after-the-script-runs)
6.  [Script Options & Parameters](#script-options--parameters)
    *   [Media Folder](#media-folder)
    *   [Sequence Name](#sequence-name)
    *   [.MOGRT Template Path](#mogrt-template-path)
    *   [Thumbnail Scale (%)](#thumbnail-scale-)
7.  [Helper Methods (For Advanced Users/Script Modification)](#helper-methods-for-advanced-usersscript-modification)
    *   `addClipTransition()`
    *   `createEssentialGraphicsTitle()`
8.  [Troubleshooting](#troubleshooting)
9.  [Contribution & Support](#contribution--support)

---

## 1. What is an ExtendScript?

An ExtendScript is essentially a JavaScript file that can be executed by Adobe applications like Premiere Pro, Photoshop, Illustrator, After Effects, and more. It allows you to automate repetitive tasks, create custom workflows, and extend the functionality of the applications beyond their built-in features. Think of it as writing small programs to tell Premiere Pro exactly what to do.

## 2. Features

*   **Automated Media Import:** Imports all your designated background, audio, and thumbnail files into your Premiere Pro project.
*   **Sequence Creation:** Creates a new Premiere Pro sequence, automatically named for your project.
*   **Dynamic Track Management:** Automatically creates and uses enough audio tracks for each of your song clips.
*   **Background Placement (V1):** Places your `background.jpg` image on Video Track 1 (V1), extending its duration to cover the entire length of your music mix.
*   **Sequential Audio (A1, A2, A3...):** Each audio clip is placed sequentially, but on its **own dedicated audio track**. This makes fine-tuning transitions between songs much easier after the script runs.
*   **Synchronized Text Graphics (V2):**
    *   Extracts the "Artist - Song" title from your audio filenames.
    *   **Prioritizes Essential Graphics (.MOGRT):** If you provide a path to an Essential Graphics template (a `.mogrt` file) with a "Source Text" property, it will create professional, customizable titles on Video Track 2 (V2), synchronized with each audio clip.
    *   **Fallback to Legacy Titles:** If no `.mogrt` path is provided or if the `.mogrt` fails, it automatically creates basic Legacy Titles (the older Premiere Pro title format) on V2.
*   **Synchronized Thumbnails (V3):** Automatically places corresponding thumbnail images (e.g., album art) on Video Track 3 (V3), also synchronized with each audio clip and scaled to your specified percentage.
*   **Interactive ScriptUI:** Provides a user-friendly interface within Premiere Pro to configure key parameters like media folder, sequence name, `.mogrt` path, and thumbnail scale.
*   **Robust Error Handling:** Includes checks for missing files, import failures, and other common issues, providing informative alerts.

## 3. Requirements

*   **Adobe Premiere Pro:** Any recent Creative Cloud version (CC 2018 or newer recommended for full compatibility, especially with Essential Graphics).
*   **Media Files:**
    *   A single background image named `background.jpg`.
    *   Audio files in `.wav` or `.mp3` format, strictly named `XX Artist - Song.wav` (e.g., `01 Daft Punk - One More Time.mp3`, `02 Calvin Harris - Feel So Close.wav`). The `XX` must be a two-digit number (01-99).
    *   (Optional) Thumbnail image files (JPG or PNG) strictly named `XX Artist - Song.jpg` (e.g., `01 Daft Punk - One More Time.jpg`). These should match your audio filenames.

## 4. Setup & Installation

### Step 1: Save the Script

1.  **Copy the entire script code** provided in the previous response.
2.  Open a plain text editor (like Notepad on Windows, TextEdit on macOS – ensure it's in plain text mode, not rich text).
3.  Paste the script code into the text editor.
4.  Save the file with a `.jsx` extension (e.g., `AutomatedMusicMix.jsx`). **Crucially, ensure the file is saved as plain text, not a `.txt` file with `.jsx` appended.**

### Step 2: Place Your Media Files

1.  Create a dedicated folder on your computer for all the media files related to your music mix (e.g., `C:\Users\YourUser\Documents\MyMusicMixMedia` or `/Users/YourUser/Documents/MyMusicMixMedia`).
2.  Place your `background.jpg` image in this folder.
3.  Place all your audio clips in this folder, ensuring they follow the exact naming convention: `XX Artist - Song.wav` (or `.mp3`).
4.  (Optional) Place your thumbnail images in this folder, ensuring they follow the exact naming convention: `XX Artist - Song.jpg` (or `.png`), matching their corresponding audio files.

    **Example Media Folder Contents:**
    *   `background.jpg`
    *   `01 Daft Punk - One More Time.mp3`
    *   `01 Daft Punk - One More Time.jpg`
    *   `02 Calvin Harris - Feel So Close.wav`
    *   `02 Calvin Harris - Feel So Close.png`
    *   `03 The Weeknd - Blinding Lights.mp3`
    *   `03 The Weeknd - Blinding Lights.jpg`

### Step 3: Update the Script's Default Path (Optional but Recommended)

You can tell the script where to *initially* look for your media folder. This saves you from browsing every time you run the script.

1.  Open your `AutomatedMusicMix.jsx` file in a text editor.
2.  Find the line that looks like this:
    ```javascript
    var defaultSourceFolder = "/Users/yourusername/Documents/MusicMixMedia"; // <--- **CHANGE THIS PATH**
    ```
3.  **Replace the example path** with the actual absolute path to your media folder (from Step 2). Make sure to use forward slashes `/` for macOS/Linux paths, or double backslashes `\\` for Windows paths (e.g., `C:\\My Media\\Music Mix`).
4.  Save the `AutomatedMusicMix.jsx` file.

### Step 4: Essential Graphics Template (.MOGRT) Setup (Optional)

If you want professional-looking titles, you'll use an Essential Graphics Template. If not, the script will fall back to basic Legacy Titles.

#### What is a .MOGRT?

A `.mogrt` (Motion Graphics Template) is a powerful way to create animated titles, lower thirds, or other graphics in After Effects or Premiere Pro, and then reuse them easily. They have customizable properties (like "Source Text", colors, fonts) exposed for easy editing in Premiere Pro's Essential Graphics Panel.

#### Creating Your Own .MOGRT (Simple Text Example)

If you don't have one, here's how to make a basic one in Premiere Pro:

1.  Open Premiere Pro and go to the **Essential Graphics** workspace (`Window > Workspaces > Graphics`).
2.  In the Essential Graphics panel, click the **"New Layer"** icon (a square with a plus sign) and choose **"Text"**.
3.  Type some placeholder text (e.g., "Song Title").
4.  Style the text (font, size, color, position) using the controls in the Essential Graphics panel.
5.  **Important:** Ensure the text layer is selected. In the Essential Graphics panel, scroll down to the "Text" section. You should see a stopwatch icon next to "Source Text". Click the **T-shaped icon** next to "Source Text" to **pin this property** to your template. This makes it editable by the script.
6.  At the bottom right of the Essential Graphics panel, click **"Export Motion Graphics Template..."**.
7.  Give it a name (e.g., `MySongTitleTemplate`), choose a destination (e.g., `Local Templates Folder` or a specific folder you'll remember), and click **OK**.

#### Finding Your .MOGRT Path

*   If you saved it to your `Local Templates Folder`, it will be in a system-specific location (e.g., `C:\Users\YourUser\AppData\Roaming\Adobe\Common\Motion Graphics Templates` on Windows, or `/Users/YourUser/Library/Application Support/Adobe/Common/Motion Graphics Templates` on macOS).
*   If you saved it to a specific folder, navigate there.
*   Copy the **absolute path** to your `.mogrt` file (e.g., `C:\MyMogrts\MySongTitleTemplate.mogrt` or `/Users/YourUser/Mogrts/MySongTitleTemplate.mogrt`). You'll enter this into the ScriptUI later.

## 5. Usage

### Step 1: Open Premiere Pro

*   Launch Adobe Premiere Pro.
*   Open an existing project or create a new one. The script will create a new sequence within this open project.

### Step 2: Run the Script

1. 	Open VS Code Workspace  C:\Users\jkted/Music\~mixtape\TOOLS\mixtape extendscript  
2.  execute `extendScript-Debug attach` extension.
3. 	Set the target application to `Adobe Premiere Pro`
4. 	Open your AutomatedMusicMix.jsx file in VS Code
    - Right-click anywhere in the editor and choose “ExtendScript: Evaluate Script in Attached Host”
    - or use the Command Palette (Ctrl+Shift+P) and run:
“ExtendScript: Evaluate Script in Attached Host”

    Your ScriptUI dialog should now appear inside Premiere Pro!

🧠 Pro Tip
If you want to run the script repeatedly, you can bind a shortcut to the “Evaluate Script” command or create a task runner. Let me know if you want help with that.

Want to add logging, breakpoints, or inspect variables while the UI is active? You can do that too—just say the word.
` file and hit Run.
Your ScriptUI dialog will appear inside Premiere Pro.


### Step 3: Interacting with the ScriptUI

Once you run the script, a "Music Mix Timeline Creator" dialog box will appear. This is the ScriptUI that allows you to configure the script's options without editing the code.

#### Understanding the ScriptUI Fields:

1.  **Media Folder:**
    *   This field will default to the path you set in Step 3 of the setup.
    *   **Click the "Browse..." button** to navigate to and select your media folder (the one containing `background.jpg`, audio, and thumbnails). This is the most important setting.
2.  **Sequence Name:**
    *   Enter the desired name for the new Premiere Pro sequence that the script will create (e.g., "My Epic Music Mix 2024").
3.  **`.MOGRT` Template Path (Optional):**
    *   If you created an Essential Graphics template (Step 4 of setup), **click the "Browse..." button** and navigate to your `.mogrt` file. Select it.
    *   If you leave this blank, the script will create basic Legacy Titles instead.
    *   **Click the "?" button** for a quick reminder on `.mogrt` usage.
4.  **Thumbnail Scale (%):**
    *   Enter a percentage value (e.g., `50` for 50%, `100` for 100%). This controls the size of your thumbnail images on Video Track 3. You can adjust this later in Premiere Pro, but this sets a good starting point.

#### Running or Cancelling:

*   **Click "Run Script"** to start the timeline creation process.
*   **Click "Cancel"** to close the dialog and abort the script.

### Step 4: After the Script Runs

*   The script will process your files and create a new sequence in your open Premiere Pro project.
*   It will provide `alert` messages for warnings or errors if anything goes wrong during the process. Pay attention to these.
*   Once completed, an alert will confirm "Music Mix Sequence created successfully!".
*   You will find the new sequence opened and active in your Premiere Pro timeline panel.

## 6. Script Options & Parameters

Here's a detailed explanation of the parameters configurable via the ScriptUI:

### Media Folder

*   **Purpose:** Specifies the absolute path to the directory containing all your source media files (`background.jpg`, audio clips, and thumbnail images).
*   **Requirement:** This is mandatory. The script will fail if the folder doesn't exist or is empty.
*   **Format:**
    *   **Windows:** `C:\Your\Path\To\Media`
    *   **macOS:** `/Users/YourUser/Path/To/Media`
*   **Naming Convention:** Crucial for the script to find and parse your files correctly:
    *   **Background:** `background.jpg`
    *   **Audio:** `XX Artist - Song.wav` (or `.mp3`) - e.g., `01 Daft Punk - One More Time.mp3`
    *   **Thumbnail:** `XX Artist - Song.jpg` (or `.png`) - e.g., `01 Daft Punk - One More Time.jpg`

### Sequence Name

*   **Purpose:** The name given to the newly created Premiere Pro sequence.
*   **Default:** `Automated Music Mix`
*   **Recommendation:** Use a descriptive name to easily identify your generated timeline.

### .MOGRT Template Path

*   **Purpose:** The absolute path to your Essential Graphics Template (`.mogrt` file) to be used for the song titles.
*   **Default:** Empty (script will use Legacy Titles as fallback).
*   **Requirement:**
    *   The `.mogrt` file must exist at the specified path.
    *   The `.mogrt` must contain a text layer with its "Source Text" property exposed (pinned) in the Essential Graphics Panel. The script will try to set this property.
*   **Benefit:** Provides higher quality, more customizable titles compared to Legacy Titles.
*   **How to Get Path:** See [Step 4: Essential Graphics Template (.MOGRT) Setup](#step-4-essential-graphics-template-mogrt-setup-optional) above.

### Thumbnail Scale (%)

*   **Purpose:** Sets the initial scale (size) of the thumbnail images placed on Video Track 3.
*   **Default:** `50` (%)
*   **Range:** Any integer percentage (e.g., `25` for quarter size, `100` for original size).
*   **Note:** You can adjust the scale and position of individual thumbnails later in Premiere Pro using the Motion effect controls.

## 7. Helper Methods (For Advanced Users/Script Modification)

The script includes two powerful helper functions that you could potentially adapt or call directly if you ever decide to modify the script's core logic for more advanced use cases.

### `addClipTransition(clip, transitionName, duration, atBeginning)`

*   **Purpose:** This function allows you to programmatically add a transition to any video or audio clip.
*   **Parameters:**
    *   `clip`: The `TrackItem` object (the actual clip on the timeline) you want to add a transition to.
    *   `transitionName`: A string representing the exact name of the transition you want (e.g., `"Cross Dissolve"`, `"Dip to Black"`, `"Constant Power"`).
    *   `duration`: A `Time` object specifying how long the transition should last (e.g., `new Time(1)` for 1 second).
    *   `atBeginning`: A boolean. `true` to place the transition at the start of the clip, `false` to place it at the end.
*   **Possible Values for `transitionName`:**
    *   **Video Transitions:** "Cross Dissolve", "Dip to Black", "Dip to White", "Film Dissolve", "Additive Dissolve", "Wipe" (various types like Clock Wipe, Cross Wipe), "Iris" (various types like Iris Box, Iris Round), "Page Peel", "Slide", "Push", etc. (Explore Premiere Pro's Video Transitions folder in the Effects panel for exact names).
    *   **Audio Transitions:** "Constant Power", "Constant Gain", "Exponential Fade".
*   **Example Usage (within the script):**
    ```javascript
    // To add a 1-second Cross Dissolve at the beginning of a video clip:
    // addClipTransition(myVideoClip, "Cross Dissolve", new Time(1), true);

    // To add a 0.5-second Constant Power fade at the end of an audio clip:
    // addClipTransition(myAudioClip, "Constant Power", new Time(0.5), false);
    ```

### `createEssentialGraphicsTitle(mogrtPath, textContent)`

*   **Purpose:** This function creates a new `ProjectItem` in your Premiere Pro project from a `.mogrt` file and attempts to set its "Source Text" property.
*   **Parameters:**
    *   `mogrtPath`: The absolute file path to your `.mogrt` template.
    *   `textContent`: The string of text you want to appear in the title (e.g., "Artist - Song").
*   **Returns:** A `ProjectItem` object representing the new Essential Graphics title, or `null` if creation fails.
*   **Internal Working:** It uses Premiere Pro's Quality Editor (`qe.project.newItemFromTemplate()`) to instantiate the `.mogrt` and then searches for a "Source Text" property to populate it.
*   **Important:** This relies on `app.enableQE()` being called at the start of the script and `app.disableQE()` at the end.

## 8. Troubleshooting

*   **"Premiere Pro is not running." / "No project is open."**: Ensure Premiere Pro is open and you have a project loaded before running the script.
*   **"Error: Source media folder does not exist."**: Double-check the path you entered in the ScriptUI (or set as `defaultSourceFolder` in the script). Make sure it's the correct absolute path to your media.
*   **"Error: 'background.jpg' not found." / "No audio files found."**:
    *   Verify `background.jpg` is present in your media folder.
    *   Ensure your audio and thumbnail files strictly follow the naming convention: `XX Artist - Song.wav/mp3/jpg/png`. The `XX` must be two digits.
*   **"Failed to import..." / "Failed to find..." after import**:
    *   Check file permissions on your media folder. Premiere Pro needs read access.
    *   Ensure the filenames are exactly as expected, including extensions.
    *   Try importing one of the problematic files manually into Premiere Pro to see if it imports successfully.
*   **"Error creating sequence..."**: This can happen if Premiere Pro can't determine sequence settings from your first audio clip. Try setting a specific `sequencePresetPath` in the script's code if you encounter this, or manually create a sequence first.
*   **"Warning: Could not find 'Source Text' property in MOGRT..."**:
    *   This means your `.mogrt` file doesn't have its "Source Text" property correctly exposed/pinned in the Essential Graphics Panel. Re-export your `.mogrt` making sure to pin "Source Text".
    *   The script will still try to use the `.mogrt`, but you'll have to manually type the title in Premiere Pro's Essential Graphics panel for each instance.
*   **Script doesn't do anything after clicking "Run Script"**:
    *   Check for any hidden error messages or alert dialogs that might be behind other windows.
    *   Make sure `app.enableQE();` is at the beginning and `app.disableQE();` is at the end of your script's execution block.

## 9. Contribution & Support

This script is provided as a powerful automation tool. If you have suggestions for improvements, find bugs, or want to extend its functionality, feel free to modify the `.jsx` file! While direct support isn't provided, the community resources for ExtendScript development are vast.