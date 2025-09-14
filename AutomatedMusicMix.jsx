function createMusicMixVideoTimeline() {

    // --- 1. Configuration & Setup ---

    $.writeln("1. Configuration & Setup");
    if (!app) {
        alert("No host application context — attach debugger to Premiere first.");
        return;
    }

    var project = app.project;
    if (!project) {
        alert("No project is open. Please open or create a project in Premiere Pro.");
        return;
    }

    app.enableQE(); // Enable Quality Editor (essential for transitions)


    // Configurable values
    // Consider aligning sets of script, Proj template, and AE Title for consistent constant scales.
    // Finish the CEP extension Last, try and read param there, passing param for this script in the index button? 
    var sourceFolder = "C:\\Users\\jkted\\Music\\~mixtapes\\~current-mix"; // *** Drop Media Here ***
    var sequencePresetPath = "C:\\Users\\jkted\\Documents\\Adobe\\Premiere Pro\\25.0\\Profile-jkted\\Settings\\Custom\\AutomatedMixtapeSequence1080.sqpreset"; // Path to your .sqpreset template
    var sequenceName = "AutomatedMixtapeSequence1080";
    var framerate = 29.97;
    var backgroundName = "background.jpg";
    var backgrounWidth = 5881;   // *** MUST CHANGE ***
    var backgroundHeight = 3921; // *** MUST CHANGE ***
    var thumbnailOpacity = 99;
    var thumbnailScale = 12;
    var thumbnailPosX = 200;  // LEFT:200 RIGHT:1080
    var thumbnailPosY = 200;  // TOP:200 BOTTOM:1080
    var thumbnailTransitionDuration = '00;00;00;29';
    var introTransitionDuration = '00;00;07;00';
    var outroTransitionDuration = '00;00;03;00';

    // --- Helper Functions ---

    // Function to find a project item by its name (case-insensitive, partial match for robustness)
    function findProjectItemByName(name) {
        var foundItem = null;
        function searchChildren(item) {
            for (var i = 0; i < item.children.numItems; i++) {
                var child = item.children[i];
                if (child.name && child.name.toLowerCase() === name.toLowerCase()) { // Exact match for reliability
                    foundItem = child;
                    return true; // Found, stop searching
                }
                if (child.type === ProjectItemType.BIN) {
                    if (searchChildren(child)) {
                        return true; // Found in sub-bin
                    }
                }
            }
            return false;
        }
        searchChildren(project.rootItem);
        return foundItem;
    }

    function fitBackgroundToSequenceScale(sequence, sizeWidth, sizeHeight) {
        var seqWidth = sequence.frameSizeHorizontal;
        var seqHeight = sequence.frameSizeVertical;

        if (!sizeWidth || !sizeHeight || !seqWidth || !seqHeight) {
            $.writeln("Missing dimension data.");
            return;
        }

        var scaleX = seqWidth / sizeWidth;
        var scaleY = seqHeight / sizeHeight;
        var scaleFactor = Math.min(scaleX, scaleY) * 100; //Percentage

        $.writeln("Applied scale: " + scaleFactor.toFixed(3) + "%"); //Round
        return scaleFactor;
    }

    function scaleClipCoordToSequence(sequence, posWidth, posHeight) {
        var seqWidth = sequence.frameSizeHorizontal;
        var seqHeight = sequence.frameSizeVertical;

        if (!posWidth || !posHeight || !seqWidth || !seqHeight) {
            $.writeln("Missing dimension data.");
            return;
        }

        var scaleX = posWidth / seqWidth;
        var scaleY = posHeight / seqHeight;

        $.writeln("Coord scaleX: " + scaleX.toFixed(3) + "scaleY: " + scaleY.toFixed(3));
        return [scaleX, scaleY];
    }

    function padStart(str, targetLength, padChar) {
        str = String(str); // Ensure it's a string
        while (str.length < targetLength) {
            str = padChar + str;
        }
        return str;
    }

    function debugClipComponents(clip) {
        if (!clip || !clip.components || clip.components.numItems === 0) {
            $.writeln("No components found on clip: " + (clip ? clip.name : "undefined"));
            return;
        }

        $.writeln("Clip: " + clip.name);
        $.writeln("Total components: " + clip.components.numItems);

        for (var i = 0; i < clip.components.numItems; i++) {
            var component = clip.components[i];
            $.writeln("  Component " + i + ": " + component.displayName);

            if (component.properties && component.properties.numItems > 0) {
                for (var j = 0; j < component.properties.numItems; j++) {
                    var prop = component.properties[j];
                    $.writeln("    Property " + j + ": " + prop.displayName + " = " + prop.getValue());
                }
            } else {
                $.writeln("    No properties found.");
            }
        }
    }

    function debugSequenceVideoTracks(sequence) {
        if (sequence && sequence.videoTracks && sequence.videoTracks.numTracks > 0) {
            $.writeln("Total video tracks: " + sequence.videoTracks.numTracks);

            for (var i = 0; i < sequence.videoTracks.numTracks; i++) {
                var track = sequence.videoTracks[i];
                $.writeln("Video Track " + i + ":");

                $.writeln("  Name: " + track.name);
                $.writeln("  Number of clips: " + track.clips.numItems);

                for (var j = 0; j < track.clips.numItems; j++) {
                    var clip = track.clips[j];
                    $.writeln("    Clip " + j + ":");
                    $.writeln("      Name: " + clip.name);
                    $.writeln("      Start: " + clip.start);
                    $.writeln("      End: " + clip.end);
                    $.writeln("      Duration: " + clip.duration);
                    $.writeln("      Type: " + clip.type);
                }
            }
        } else {
            $.writeln("No video tracks found or sequence is invalid.");
        }
    }

    function debugSequenceAudioTracks(sequence) {
        if (sequence && sequence.videoTracks && sequence.videoTracks.numTracks > 0) {
            $.writeln("Total video tracks: " + sequence.videoTracks.numTracks);

            for (var i = 0; i < sequence.videoTracks.numTracks; i++) {
                var track = sequence.videoTracks[i];
                $.writeln("Video Track " + i + ":");

                $.writeln("  Name: " + track.name);
                $.writeln("  Number of clips: " + track.clips.numItems);

                for (var j = 0; j < track.clips.numItems; j++) {
                    var clip = track.clips[j];
                    $.writeln("    Clip " + j + ":");
                    $.writeln("      Name: " + clip.name);
                    $.writeln("      Start: " + clip.start);
                    $.writeln("      End: " + clip.end);
                    $.writeln("      Duration: " + clip.duration);
                    $.writeln("      Type: " + clip.type);
                }
            }
        } else {
            $.writeln("No video tracks found or sequence is invalid.");
        }
    }

    function setComponentProperty(component, targetPropName, newValue) {
        if (!component || !component.properties || component.properties.numItems === 0) {
            $.writeln("No properties found in component: " + component.displayName);
            return false;
        }

        for (var p = 0; p < component.properties.numItems; p++) {
            var prop = component.properties[p];
            if (prop && prop.displayName === targetPropName) {
                prop.setValue(newValue);
                return true;
            }
        }

        $.writeln("Property '" + targetPropName + "' not found or not editable in '" + component.displayName + "'.");
        return false;
    }

    function getVideoClipByName(name) {
        var sequence = app.project.activeSequence;

        if (!sequence || !sequence.videoTracks || sequence.videoTracks.numTracks === 0) {
            $.writeln("No active sequence or video tracks found.");
            return null;
        }

        for (var i = 0; i < sequence.videoTracks.numTracks; i++) {
            var track = sequence.videoTracks[i];

            for (var j = 0; j < track.clips.numItems; j++) {
                var clip = track.clips[j];

                if (clip.name === name) {
                    return clip;
                }
            }
        }

        $.writeln("Clip named '" + name + "' not found in any video track.");
        return null;
    }

    function getAudioClipByName(name) {
        var sequence = app.project.activeSequence;

        if (!sequence || !sequence.audioTracks || sequence.audioTracks.numTracks === 0) {
            $.writeln("No active sequence or audio tracks found.");
            return null;
        }

        for (var i = 0; i < sequence.audioTracks.numTracks; i++) {
            var track = sequence.audioTracks[i];

            for (var j = 0; j < track.clips.numItems; j++) {
                var clip = track.clips[j];

                if (clip.name === name) {
                    return clip;
                }
            }
        }

        $.writeln("Clip named '" + name + "' not found in any audio track.");
        return null;
    }


    // Function to get a video track by index. Does NOT create new tracks.
    function getVideoTrack(sequence, trackIndex) {
        // Ensure the sequence is active before trying to access its tracks, especially if adding tracks later.
        if (app.project.activeSequence !== sequence) {
            app.project.activeSequence = sequence;
        }
        if (trackIndex >= 0 && trackIndex < sequence.videoTracks.numTracks) {
            return sequence.videoTracks[trackIndex]; // Directly use the passed 'sequence' object
        }
        $.writeln("Error: Video track " + (trackIndex + 1) + " does not exist.");
        return null;
    }

   
    // Function to get an audio track by index. Does NOT create new tracks.
    function getAudioTrack(sequence, trackIndex) {
        // Ensure the sequence is active before trying to access its tracks, especially if adding tracks later.
        if (app.project.activeSequence !== sequence) {
            app.project.activeSequence = sequence;
        }
        if (trackIndex >= 0 && trackIndex < sequence.audioTracks.numTracks) {
            return sequence.audioTracks[trackIndex]; // Directly use the passed 'sequence' object
        }
        $.writeln("Error: Audio track " + (trackIndex + 1) + " does not exist.");
        return null;
    }

     function getQeVideoTrack(qeSeq, index) {
        return qeSeq.getVideoTrackAt(index);
    }

    function getQeAudioTrack(qeSeq, index) {
        return qeSeq.getAudioTrackAt(index);
    }

    // Helper to get a QETrackItem from a DOM TrackItem
    function getQeTrackItem(domTrackItem) {
        // This is a bit tricky. QETrackItem doesn't have a direct lookup by GUID.
        // You often have to iterate through qeTrack.getClips() and match by name or start/end.
        // For simplicity, we'll assume we can find it by its position on the track.
        var qeTrack = getQeVideoTrack(qeSequence, domTrackItem.trackIndex); // Assuming video
        if (qeTrack) {
            for (var i = 0; i < qeTrack.numItems; i++) { // numItems is for clips on qeTrack
                var qeClip = qeTrack.getItemAt(i);
                // This is a heuristic, may need more robust matching if clips have same name/start
                if (qeClip.name === domTrackItem.name && qeClip.start.ticks === domTrackItem.start.ticks) {
                    return qeClip;
                }
            }
        }
        return null;
    }

    function setMoGRTProperty(clip, property, value) {
        if (clip) {
            var moComp = clip.getMGTComponent();
            if (moComp) {
                var params = moComp.properties;
                for (var z = 0; z < params.numItems; z++) {
                    var thisParam = params[0];
                }
                var srcTextParam = params.getParamForDisplayName(property);
                if (srcTextParam) {
                    var val = srcTextParam.getValue();
                    //$.writeln(val)
                    srcTextParam.setValue(value);
                }
            }
        }
    }

    function importMoGRT() {
		if (sequence) {
			var filterString = "";
			if (Folder.fs === 'Windows') {
				filterString = "Motion Graphics Templates:*.mogrt";
			}
			return File.openDialog("Choose MoGRT", // title
				filterString, // filter available files? 
				false); // allow multiple?
        }
	}


    // --- Script Execution ---
    app.project.autoSave = false; // Disable auto-save during script execution for performance

    try {
        // --- 2. Create a New Sequence from Preset ---
        $.writeln("2. Create a New Sequence from Preset");

        var sequence = null;
        if (sequencePresetPath && new File(sequencePresetPath).exists) {
            sequence = project.createNewSequence(sequenceName, sequencePresetPath);
        } else {
            alert("Error: Sequence preset path is invalid or file does not exist: " + sequencePresetPath);
            return;
        }

        if (!sequence) {
            alert("Error: Failed to create new sequence with name: " + sequenceName + " from preset.");
            return;
        }
        app.project.activeSequence = sequence; // Make it the active sequence
        var qeSequence = qe.project.getActiveSequence(0); // initialize matching QE seq
        $.writeln("Successfully created and activated sequence: " + sequence.name);

        

        // --- 3. Gather Media Files from Folder ---
        $.writeln("3. Gather Media Files from Folder");
        var folder = new Folder(sourceFolder);
        if (!folder.exists) {
            alert("Error: Source media folder does not exist: " + sourceFolder);
            return;
        }

        var files = folder.getFiles();
        var backgroundFile = null;
        var audioFiles = [];
        var thumbnailFiles = [];

        // Filter files based on NEW naming convention
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            if (file instanceof File) {
                var fileName = file.displayName;
                if (fileName.toLowerCase() === backgroundName.toLowerCase()) { // Case-insensitive check
                    backgroundFile = file;
                } else if (fileName.match(/^\d{2} [^\-]* - .*\.(wav|mp3)$/i)) { // e.g., "01 Artist - Song.wav"
                    audioFiles.push(file);
                } else if (fileName.match(/^\d{2} [^\-]* - .*\.(jpg|png)$/i)) { // e.g., "01 Artist - Song.jpg"
                    thumbnailFiles.push(file);
                }
            }
        }

        if (!backgroundFile) {
            alert("Error: '" + backgroundName + "' not found in " + sourceFolder);
            return;
        }
        if (audioFiles.length === 0) {
            alert("Error: No audio files found matching 'XX Artist - Song.wav/mp3' in " + sourceFolder);
            return;
        }

        // Sort audio and thumbnail files by their leading number (01, 02, etc.)
        audioFiles.sort(function(a, b) {
            var numA = parseInt(a.displayName.substring(0, 2), 10);
            var numB = parseInt(b.displayName.substring(0, 2), 10);
            return numA - numB;
        });
        thumbnailFiles.sort(function(a, b) {
            var numA = parseInt(a.displayName.substring(0, 2), 10);
            var numB = parseInt(b.displayName.substring(0, 2), 10);
            return numA - numB;
        });

        // --- 4. Import Media into Project ---
        $.writeln("4. Import Media into Project");
        var importedBackground = null;
        var importedAudios = [];
        var importedThumbnails = [];

        // Import background
        try {
            project.importFiles([backgroundFile.fsName], true, project.rootItem, false);
            importedBackground = findProjectItemByName(backgroundFile.displayName);
            if (!importedBackground) {
                throw new Error("Failed to find '" + backgroundFile.displayName + "' after import.");
            }
        } catch (e) {
            alert("Error importing background image: " + e.message);
            return;
        }

        // Import audio files
        for (var i = 0; i < audioFiles.length; i++) {
            try {
                project.importFiles([audioFiles[i].fsName], true, project.rootItem, false);
                var importedAudio = findProjectItemByName(audioFiles[i].displayName);
                if (importedAudio) {
                    importedAudios.push(importedAudio);
                } else {
                    throw new Error("Failed to find '" + audioFiles[i].displayName + "' after import.");
                }
            } catch (e) {
                alert("Warning: Error importing audio file '" + audioFiles[i].displayName + "': " + e.message);
            }
        }

        // Import thumbnail files
        for (var i = 0; i < thumbnailFiles.length; i++) {
            try {
                project.importFiles([thumbnailFiles[i].fsName], true, project.rootItem, false);
                var importedThumbnail = findProjectItemByName(thumbnailFiles[i].displayName);
                if (importedThumbnail) {
                    importedThumbnails.push(importedThumbnail);
                } else {
                    throw new Error("Failed to find '" + thumbnailFiles[i].displayName + "' after import.");
                }
            } catch (e) {
                alert("Warning: Error importing thumbnail file '" + thumbnailFiles[i].displayName + "': " + e.message);
            }
        }

        if (importedAudios.length === 0) {
            alert("No audio files successfully imported. Script aborted.");
            return;
        }

        // Calculate total duration of all audio clips for background image
        var totalAudioDurationSeconds = 0;
        var audioDurations = []; // Store individual audio durations (as Time objects) for later use
        var tracklist = []; // For YouTube timestamping

        for (var i = 0; i < importedAudios.length; i++) {
            var item = importedAudios[i];
            var itemDurationTime = null;

            if (item && item.type === ProjectItemType.CLIP) {
                itemDurationTime = item.getOutPoint(); // getOutPoint() returns a Time object

                if (itemDurationTime && itemDurationTime.seconds > 0) {
                    totalAudioDurationSeconds += itemDurationTime.seconds;
                } else {
                    $.writeln("Warning: Audio item '" + item.name + "' has zero or invalid duration from getOutPoint(). Skipping.");
                    itemDurationTime = new Time(); // Default to 0 duration Time object
                    itemDurationTime.seconds = 0;
                }
            } else {
                $.writeln("Warning: Audio item '" + (item ? item.name : "undefined") + "' is not a valid clip. Skipping.");
                itemDurationTime = new Time();
                itemDurationTime.seconds = 0;
            }
            audioDurations.push(itemDurationTime);

            // Prepare tracklist entry
            var fullFileName = item.name;
            var titleMatch = fullFileName.match(/^\d{2} (.*)\.(wav|mp3)$/i);
            var displayTitle = titleMatch ? titleMatch[1] : fullFileName.split('.')[0];
            tracklist.push({
                title: displayTitle,
                startTime: new Time() // Will be set later
            });
        }


        // --- 5. Place Background Image on V1 ---
        $.writeln("5. Place Background Image on V1");
        var videoTrack1 = getVideoTrack(sequence, 0); // V1 is track index 0
        if (!videoTrack1) {
            alert("Error: Video track V1 not found in sequence. Please ensure your preset has V1.");
            return;
        }

        try {
            videoTrack1.insertClip(importedBackground, new Time(0));
            // debugSequenceVideoTracks(sequence);
            var backgroundClip = getVideoClipByName(backgroundFile.displayName);
            // debugClipComponents(backgroundClip);
            if (backgroundClip) {
                // Set length to Audio Duration +10 seconds
                var backgroundClipDuration = new Time();
                backgroundClipDuration.seconds = totalAudioDurationSeconds + 10;
                backgroundClip.end = backgroundClipDuration;

                // Set background image motion property to Scale to frame size
                var components = backgroundClip.components;
                for (var c = 0; c < components.numItems; c++) {
                    var component = components[c];
                    if (component.displayName === "Motion") { // "Motion" is the display name for the default motion effect
                        for (var p = 0; p < component.properties.numItems; p++) {
                            var prop = component.properties[p];
                            if (prop.displayName === "Scale") {
                                prop.setValue(fitBackgroundToSequenceScale(sequence, backgrounWidth, backgroundHeight));
                                break;
                            }
                        }
                    }
                }
            } else {
                throw new Error("Failed to insert background clip onto V1.");
            }
        } catch (e) {
            alert("Error placing background image: " + e.message);
            return;
        }

        // --- 6. Place Audio Clips Sequentially on Separate Tracks ---
        $.writeln("6. Place Audio Clips Sequentially on Separate Tracks");
        var currentAudioTimeSeconds = 0; // Accumulate time in seconds
        var currentAudioTime = new Time();
        var audioTrackOffset = 0; // Start with A1 (track index 0)

        for (var i = 0; i < importedAudios.length; i++) {
            var audioItem = importedAudios[i];
            var audioDuration = audioDurations[i]; // This is already a Time object

            if (!audioDuration || audioDuration.seconds === 0) {
                $.writeln("Skipping audio item: " + audioItem.name + " (zero or invalid duration).");
                continue;
            }

            // Update tracklist start time
            tracklist[i].startTime.seconds = currentAudioTimeSeconds;

            var targetAudioTrack = getAudioTrack(sequence, audioTrackOffset);
            // If the track doesn't exist, we need to add it.
            if (!targetAudioTrack) {
               throw new Error("Failed to find audio track " + audioTrackOffset);
            }

            try {
                targetAudioTrack.insertClip(audioItem, currentAudioTime);
                var insertedAudioClip = getAudioClipByName(audioItem.name)
                if (!insertedAudioClip) {
                    throw new Error("Failed to insert audio clip '" + audioItem.name + "' on track A" + (audioTrackOffset + 1));
                }
                currentAudioTime = insertedAudioClip.end;
            } catch (e) {
                alert("Error placing audio clip '" + audioItem.name + "': " + e.message);
            }

            currentAudioTimeSeconds += audioDuration.seconds; // Accumulate seconds
            audioTrackOffset++; // Move to next audio track for the next clip
        }

        // --- 7. Add Text Graphics on V2 & Thumbnails on V3 ---
        $.writeln("7. Add Text Graphics on V2 & Thumbnails on V3");
        var videoTrack2 = getVideoTrack(sequence, 1); // V2 for text graphics
        var videoTrack3 = getVideoTrack(sequence, 2); // V3 for thumbnails

        var currentTextThumbnailTimeSeconds = 0; // Accumulate time in seconds

        // --- Choose Graphics Template for Text ---
        var textMoGRTFile = importMoGRT();

        for (var i = 0; i < importedAudios.length; i++) {
            var audioItem = importedAudios[i];
            var audioDuration = audioDurations[i]; // This is already a Time object

            if (!audioDuration || audioDuration.seconds === 0) {
                continue; // Skip invalid audio items
            }

            var fullFileName = audioItem.name; // e.g., "01 Artist - Song.wav"

            // Extract title: "01 Artist - Song.wav" -> "Artist - Song"
            var titleMatch = fullFileName.match(/^\d{2} (.*)\.(wav|mp3)$/i);
            var displayTitle = titleMatch ? titleMatch[1] : fullFileName.split('.')[0]; // Fallback if regex fails

            // --- Create Text Graphic Clip ---
            var textClip = null;

            var insertPointForTextThumb = new Time();
            insertPointForTextThumb.seconds = currentTextThumbnailTimeSeconds;

            if (textMoGRTFile) {
                var mogrtFileName = new File(textMoGRTFile.fs).displayName; //???
                try {
                    //textClip = videoTrack2.insertClip(textGraphicProjectItem, insertPointForTextThumb);
                    textClip = sequence.importMGT(textMoGRTFile.fsName, 
                        insertPointForTextThumb.ticks,
                        1, // V2 for text graphics
                        0  // Any Audio to first, shouldn't be
                    )
                    if (textClip) {
                        var textClipEnd = new Time();
                        textClipEnd.seconds = currentTextThumbnailTimeSeconds + audioDuration.seconds;
                        textClip.end = textClipEnd;
                        
                        // Now, attempt to set the text on the *TrackItem*
                        var formattedTitle = displayTitle.replace(" - ", "\r");
                        setMoGRTProperty(textClip, "Title", formattedTitle);
                        //debugClipComponents(textClip);

                        // Other properties
                        var components = textClip.components;
                        for (var c = 0; c < components.numItems; c++) {
                            var component = components[c];
                            switch (component.displayName) {
                                case "Motion":
                                    continue;
                                case "Opacity":
                                    continue;
                                default:
                                    continue;
                            }
                        }
                    } else {
                        throw new Error("Failed to insert MOGRT clip for '" + displayTitle + "'");
                    }
                } catch (e) {
                    alert("Warning: Error inserting/setting MOGRT for '" + displayTitle + "': " + e.message);
                }
            }

            // --- Place Thumbnails on V3 (if found) ---
            var correspondingThumbnail = null;
            for (var j = 0; j < importedThumbnails.length; j++) {
                var thumbNameNoExt = importedThumbnails[j].name.replace(/\.(jpg|png)$/i, '');
                var audioNameNoExt = fullFileName.replace(/\.(wav|mp3)$/i, '');
                if (thumbNameNoExt === audioNameNoExt) {
                    correspondingThumbnail = importedThumbnails[j];
                    break;
                }
            }

            if (correspondingThumbnail) {
                try {
                    videoTrack3.insertClip(correspondingThumbnail, insertPointForTextThumb.ticks);
                    $.writeln(importedThumbnails[j].name);
                    var thumbnailClip = getVideoClipByName(importedThumbnails[j].name);
                    if (thumbnailClip) {
                        $.writeln("audio duration: " + audioDuration.seconds);
                        var thumbnailClipEnd = new Time();
                        thumbnailClipEnd.seconds = currentTextThumbnailTimeSeconds + audioDuration.seconds;
                        thumbnailClip.end = thumbnailClipEnd;
                        //debugClipComponents(thumbnailClip);

                       // Set thumbnail properties to Scale and Position
                        var components = thumbnailClip.components;
                        for (var c = 0; c < components.numItems; c++) {
                            var component = components[c];
                            switch(component.displayName) {
                                case "Motion":
                                    setComponentProperty(component, "Scale", thumbnailScale);
                                    setComponentProperty(component, "Position", scaleClipCoordToSequence(sequence, thumbnailPosX, thumbnailPosY))
                                    continue;
                                case "Opacity":
                                    setComponentProperty(component, "Opacity", thumbnailOpacity);
                                    continue;
                                default:
                                    continue;
                            }
                        }
                        $.writeln("Thumbnail " + (i + 1) + ": " + displayTitle);
                    } else {
                        throw new Error("Failed to insert thumbnail clip for '" + displayTitle + "'");
                    }
                } catch (e) {
                    alert("Warning: Error placing thumbnail for '" + displayTitle + "': " + e.message);
                }
            }

            currentTextThumbnailTimeSeconds += audioDuration.seconds; // Accumulate seconds
        }

        // --- 8. Insert Transitions ---
        // TODO 2: ensure it's working once they're sequential
        $.writeln("8. Insert Transitions");
        var transitionListVideo = qe.project.getVideoTransitionList(); // collect preset video transition types
        var transitionListAudio = qe.project.getAudioTransitionList(); // collect preset audio transition types
        var filmDissolve = qe.project.getVideoTransitionByName("Film Dissolve");
        var qeVideoTrack1 = qeSequence.getVideoTrackAt(0);
        var qeVideoTrack2 = qeSequence.getVideoTrackAt(1);
        var qeVideoTrack3 = qeSequence.getVideoTrackAt(2);

        
        // Beginning Transition
        qeVideoTrack1.getItemAt(0).addTransition(filmDissolve, true, introTransitionDuration);
        qeVideoTrack2.getItemAt(0).addTransition(filmDissolve, true, introTransitionDuration);
        qeVideoTrack3.getItemAt(0).addTransition(filmDissolve, true, introTransitionDuration);

        // Thumbnail Transitions
        for(i = 0; i < qeVideoTrack3.numItems; i++) {
            // transition type, atBeginning bool otherwise end, transitionduration, (default Centered). 
            var item = qeVideoTrack3.getItemAt(i);
            item.addTransition(filmDissolve, false, thumbnailTransitionDuration);
        }
        
        // Ending Transitions
        // $.writeln(qeVideoTrack2.getItemAt(qeVideoTrack2.numItems - 2).name);
        // $.writeln(qeVideoTrack3.getItemAt(qeVideoTrack3.numItems - 2).name);

        qeVideoTrack2.getItemAt(qeVideoTrack2.numItems - 1).addTransition(filmDissolve, true, outroTransitionDuration);
        qeVideoTrack3.getItemAt(qeVideoTrack3.numItems - 1).addTransition(filmDissolve, true, outroTransitionDuration);

        // --- 9. Final Sequence Adjustments ---
        $.writeln("8. Final Sequence Adjustments");

        // Set the length of the sequence/video to match the totalAudioDurationSeconds + 10 seconds
        var finalSequenceDuration = new Time();
        finalSequenceDuration.seconds = totalAudioDurationSeconds + 10;
        sequence.setOutPoint(finalSequenceDuration); // Set the sequence's out point

        // --- 10. Tracklist Printout Helper ---
        $.writeln("\n9. YouTube Tracklist Timestamps:");
        for (var i = 0; i < tracklist.length; i++) {
            var entry = tracklist[i];
            var totalSeconds = Math.floor(entry.startTime.seconds);
            var minutes = Math.floor(totalSeconds / 60);
            var seconds = totalSeconds % 60;
            var formattedTime = padStart(String(minutes), 2, '0') + ":" + padStart(String(seconds), 2, '0');
            $.writeln(formattedTime + " - " + entry.title);
        }


        alert("Music Mix Sequence '" + sequenceName + "' created successfully!");

    } catch (e) {
        alert("An unhandled error occurred: " + e.message + " on line " + e.line);
    } finally {
        app.disableQE(); // Disable Quality Editor
        app.project.autoSave = true; // Re-enable auto-save
    }
}

// Run the main function
createMusicMixVideoTimeline();