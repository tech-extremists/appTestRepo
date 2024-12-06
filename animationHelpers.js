/**
 * @fileoverview Animation helper functions
 * 
 * @author Dila Tosun
 * @id 22102100
 * 
 * @author Ahmet Kaan Sever
 * @id 22102278
 */

// Saves the current theta and translation values of the current keyframe.
function saveCurrKeyframe(){
    saveKeyframeButton.onclick = function () {
        console.log("Type of array element original: " + typeof(theta[0][0]));
        keyframes.thetaVals.push(JSON.parse(JSON.stringify(theta)));
        keyframes.translationVals.push([xTransVal, yTransVal, 0.0]);
        console.log(keyframes);
        console.log("keyframes saved");
    }
}

// Plays the latest saved keyframes.
function animate(duration = 1000) {
    if (keyframes.thetaVals.length < 2) {
        console.log("At least two keyframes are required to animate.");
        return;
    }
    console.log(keyframes);

    let currentFrame = 0;
    const totalFrames = keyframes.thetaVals.length - 1;
    const steps = Math.floor((60 * duration) / 1000); // Number of steps
    const interval = duration / (steps * totalFrames); // Time interval

    let currentStep = 0;
    let interpolatedTheta = [];
    let interpolatedTranslation = [];

    function interpolateKeyframes(startTheta, endTheta, startTranslation, endTranslation) {
        const thetaSteps = insert(startTheta.flat(), endTheta.flat(), steps);
        const translationSteps = insert(startTranslation, endTranslation, steps);

        return { thetaSteps, translationSteps };
    }

    function interpolate() {
        if (currentFrame >= totalFrames) {
            console.log("Animation complete.");
            return;
        }

        if (currentStep === 0) {
            // Start end keyframes
            const startTheta = keyframes.thetaVals[currentFrame];
            const endTheta = keyframes.thetaVals[currentFrame + 1];
            const startTranslation = keyframes.translationVals[currentFrame];
            const endTranslation = keyframes.translationVals[currentFrame + 1];

            // Interpolation
            const { thetaSteps, translationSteps } = interpolateKeyframes(
                startTheta,
                endTheta,
                startTranslation,
                endTranslation
            );

            interpolatedTheta = thetaSteps;
            interpolatedTranslation = translationSteps;
        }

        for (let i = 0; i < numNodes; i++) {
            theta[i] = [
                interpolatedTheta[currentStep][i * 3],       // X value
                interpolatedTheta[currentStep][i * 3 + 1],   // Y value
                interpolatedTheta[currentStep][i * 3 + 2]    // Z value
            ];
        }

        initNodesForAll();

        [xTransVal, yTransVal, zTransVal] = interpolatedTranslation[currentStep];

        renderOnce();

        currentStep++;

        if (currentStep > steps) {
            currentFrame++;
            currentStep = 0;
        }
        vertexArray = getData();
        setTimeout(() => requestAnimationFrame(interpolate), interval);
    }

    console.log("Starting animation...");
    interpolate();
}

// Resets the saved keyframes. 
function resetKeyFrames() {
    resetKFButton.onclick = function () {
        keyframes.thetaVals = [];
        keyframes.translationVals = [];
        console.log("Resetting keyframes...");
        console.log(keyframes);
    }
    vertexArray = newVert;
}

// SAVE AND LOAD
// Save the keyframes to a file.
function saveAnimation() {
    console.log("Save button clicked");
    const animationData = JSON.stringify(keyframes, null, 2);
    const blob = new Blob([animationData], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "animation.json"; 
    a.click();
    URL.revokeObjectURL(url); 
}

// Load the keyframes from a file.
function loadAnimation() {
    console.log("Load button clicked");
    const file = event.target.files[0];
    if (!file) {
        console.error("No file selected");
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const loadedKeyframes = JSON.parse(e.target.result);

            if (loadedKeyframes.thetaVals && loadedKeyframes.translationVals) {
                keyframes.thetaVals = loadedKeyframes.thetaVals;
                keyframes.translationVals = loadedKeyframes.translationVals;
                console.log("Keyframes loaded:", keyframes);
            } else {
                console.error("Invalid animation file format");
            }
        } catch (error) {
            console.error("Error parsing animation file:", error);
        }
    };
    vertexArray = keyframes.data;
    reader.readAsText(file);
}
