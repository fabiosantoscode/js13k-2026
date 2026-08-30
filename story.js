// let currentStoryBeat defined in engine.js, reads ?story=\d+
// reset the saved state (between deaths)
let resetToGameStart = () => {
    markMut('currentStoryBeat')
    markMut('savedPlayerTransform')
    markMut('planetsConsumed')
    currentStoryBeat = 0
    savedPlayerTransform = undefined
    planetsConsumed = []
}
let savedPlayerTransform
let story = [
    [
        [
            'Arrow keys = look around',
            'Arrow keys = look around',
            'WASD keys = move',
            'WASD keys = move',
            'You can use a gamepad',
            'You can use a gamepad',
            'BASE: Omega Rainbow 45-U\n    Do you copy? Please respond\n',
            '\n\nYOU: Where am I?',
            'BASE: You really did it this time.\nWhat is your status?',
            '\nYOU: I think I hallucinated a huge\n    pink THING outside the ship',
            'BASE: Stop joking around!\n    You\'re lucky you survived.',
            'BASE: Use your ship\'s FUEL SUC.',
            '\n\nYOU: This planet seems... Fishy',
        ],
        () => {
            resetCameraTransform()
            setCameraPosition(
                vecAddVec(
                    planetFishy[planetTransform][0],
                    skipToFishy ? [200, 0, -200] : [2000, 0, -2000]
                )
            )
            setCameraRotation2(matRotateY(TAU * .36))
            // spaceGameInertia = skipToFishy ? [0, -0.25, 0] : [0, -0.1, 0]
            // spaceGameRotationInertia = matRotateX(0.002)
            fuel = 0.1
        },
        (isFirstFrame) => {
            return getConsumedPlanets() // advance the story the first time a planet gets eaten
        },
    ],
    [
        [
            "\nYOU: What?\n    BASE, what the hell is that?",
            "\n\nRADIO: A planet-eating entity.",
            "\n\n\nRADIO: A unicorn",
            "\nYOU: Are you serious?",
            "BASE: It just CONSUMED that\n    planet you were on",
            "\nYOU: You're joking.",
            "BASE: I wish I was.",
            "BASE: Quick, get to another planet\n    and try to lose the tail!",
            "\n\nYOU: I sure hope this isn't what\n    I think it is.",
            "BASE: GET GOING!",
            "\nYOU: I am!",
        ],
        () => {
            setUnicornSpeedAccel(unicornSpeedEasy, unicornAccelEasy)
        },
        (isFirstFrame) => {
            return !isFirstFrame && getConsumedPlanets() && landedOnPlanet
        },
    ],
    [
        [
            "BASE: You seem to have escaped.",
            "\nYOU: What do I do now?",
            "BASE: What can you do?",
            "BASE: ...",
            "BASE: FUEL SUCC more planets.",
            "\n    Then, escape.",
            "\n\nYOU: It might be too late...",
        ],
        () => {
            setUnicornSpeedAccel(unicornSpeedVeryEasy, unicornAccelVeryEasy)
        },
        (isFirstFrame) => {
            return getConsumedPlanets() > 4
        },
    ],
    [
        [
            "\nYOU: I think I'm being punished",
            "RADIO: Why?",
            "\nYOU: This can't be a coincidence!",
            "\nYOU: I wrote so many horror\n    stories where the monster was\n    a manifestation of my regret,\n    eating everything that\n    I tried to enjoy.",
            "\nYOU: And something like this?\n\n    This can't be a coincidence!",
            "RADIO: I wouldn't worry about it.\n    I'll call the brain engineer\n    for you. You'll talk about this\n    for a while, maybe get some\n    SPACE MEDS, and feel better\n    in no time.",
        ],
        () => {
            setUnicornSpeedAccel(unicornSpeedMedium, unicornAccelMedium)
        },
        (isFirstFrame) => {
            return getConsumedPlanets() > 5
        },
    ],
    [
        [
            "\nYOU: I wonder if I'm still alive.",
            "RADIO: Just one more planet.\n    You'll come home.",
        ],
        () => {
            setUnicornSpeedAccel(unicornSpeedMedium, unicornAccelMedium)
        },
        (isFirstFrame) => {
            return getConsumedPlanets() > 6
        },
    ],
    /* story template
    [
        [
            "BASE: Something HUGE approaching!!", // maximum length
        ],
        () => {
            // Init story beat
        },
        (isFirstFrame) => {
            if (isFirstFrame) {
                return 0
            } else {
                return 0 // always false
            }
        },
    ],
    */
    // reset the game save, switch to endgame screen
    [
        [],
        () => { resetToGameStart(); currentScreen = SCREEN_ENDGAME },
        () => {},
    ],
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

        if (savedPlayerTransform) {
            [cameraTransform, cameraTransformInv] = savedPlayerTransform
        }

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
        if (currentStoryBeat) {
            // unless we reset (or are in the first try) save our position
            savedPlayerTransform = structuredClone([cameraTransform, cameraTransformInv])
        }
        savedPlayerTransform
        markMut('currentStoryBeat') // no need to reset
        currentStoryBeat++
        storyState = STORY_STATE_RESET;
    }
}
