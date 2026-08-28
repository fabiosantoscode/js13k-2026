// let currentStoryBeat defined in engine.js, reads ?story=\d+
let storyVarHaveLandedForTheFirstTime
let story = [
    [
        [
            'RADIO: Omega Rainbow 45-U\n    Do you copy? Please respond\n',
            '\n\nYOU: Where am I?',
            'RADIO: You really did it this time.\nWhat is your status?',
            '\nYOU: I think I hallucinated a huge\n    pink THING outside the ship',
            'RADIO: Shut up!\n    Idiot!\n    You\'re lucky you survived.',
            'RADIO: Use your ship\'s FUEL SUCC.',
            '\n\nYOU: This planet seems... Fishy',
        ],
        () => {
            resetCameraTransform()
            setCameraPosition(
                vecAddVec(
                    planetFishy[planetTransform][0],
                    skipToFishy ? [0, 130, -3] : [1000, 0, -1000]
                )
            )
            setCameraRotation2(matRotateY(TAU * .36))
            // spaceGameInertia = skipToFishy ? [0, -0.25, 0] : [0, -0.1, 0]
            // spaceGameRotationInertia = matRotateX(0.002)
            fuel = 0.1
        },
        (initialFrame) => {
            if (initialFrame) {
                markMut('storyVarHaveLandedForTheFirstTime')
                storyVarHaveLandedForTheFirstTime = 0
                return 0
            } else if (landedOnPlanet) {
                storyVarHaveLandedForTheFirstTime = 1
                return 0
            } else {
                return storyVarHaveLandedForTheFirstTime && !landedOnPlanet
            }
        },
    ],
    [
        [
            "RADIO: Something HUGE approaching!",
            "\nYOU: Are you serious?",
            "RADIO: A planet-eating entity.\n    A unicorn.",
            "\nYOU: You're joking.",
            "RADIO: See for yourself.\n    Look behind you.",
        ],
        () => {
            setUnicornSpeed(unicornSpeedEasy)
        },
        (initialFrame) => {
            if (initialFrame) {
                return 0
            } else if (landedOnPlanet) {
                return 0
            } else {
                return 0 // always false
            }
        },
    ],
    /* story template
    [
        [
            "RADIO: Something HUGE approaching!!", // maximum length
        ],
        () => {
            // Init story beat
        },
        (initialFrame) => {
            if (initialFrame) {
                return 0
            } else if (landedOnPlanet) {
                return 0
            } else {
                return 0 // always false
            }
        },
    ],
    */
]
let storyState // 0: reset. 1: words
let STORY_STATE_RESET = 0
let STORY_STATE_WORDS = 1
let showWordsIndex
let showWordsTime = 3
let showingTheseWordsUntil
/** returns truthy if should skip frame */
let advanceStory = (isFirstFrame, [wordsList, initialize, shouldGoToNext] = story[currentStoryBeat]) => {
    if (isFirstFrame) {
        // Support skipping with ?story=N
        story.slice(0, currentStoryBeat).map(prevStoryBeat => prevStoryBeat[1]())
    }
    if (!storyState || isFirstFrame) {
        markMut('storyState')
        markMut('showWordsIndex')
        showWordsIndex = -1

        storyState = STORY_STATE_WORDS;
        initialize()
        shouldGoToNext(1)
    }

    // Just keep increasing the current word, who cares
    if (showWordsIndex < 0 || showingTheseWordsUntil < TIME) {
        showWordsIndex++
        markMut('showingTheseWordsUntil')
        showingTheseWordsUntil = TIME + showWordsTime
    }
    if (wordsList[showWordsIndex]) {
        assert(() => !wordsList[showWordsIndex].split('\n').some(line => line.length > 35))
        frameLog2(wordsList[showWordsIndex])
    }

    if (shouldGoToNext()) {
        markMut('currentStoryBeat') // no need to reset
        currentStoryBeat++
        storyState = STORY_STATE_RESET;
    }
}
