let skipStory = !self.production && /skipstory=1/.test(location)
let savedGame = +tryCatch(() => localStorage[location]) || 0
let saveGame = () => tryCatch(() => localStorage[location] = savedGame)
let story = [
    [
        [
            'RADIO: Omega Rainbow 45-U',
            '\n...',
            'RADIO: Omega Rainbow, do you copy?',
            '\nYOU: Yeah...',
            'RADIO: What is your status?',
            '\nYOU: Where am I?',
            'RADIO: You really did it this time.',
            '\nYOU: Okay, okay mom...',
            'RADIO: Shut up, idiot!',
            'RADIO: You\'re lucky you survived.',
            'RADIO: There\'s a planet close by.',
            'RADIO: Use your ship\'s FUEL SUCC.',
            '\nYOU: ...If I can land on it'
        ],
        () => {
            setCameraPosition(
                vecAddVec(
                    planetFishy[planetTransform][0],
                    [0, 3000, -30]
                )
            )
            setCameraRotation2(matRotateY(TAU/2))
            setCameraRotation2(matRotateX(TAU*0.24))
            spaceGameInertia = [0, -0.5, 0]
            spaceGameRotationInertia = matRotateY(0.002)
            fuel = 0.1
        },
        () => 0, // false
    ],
]
let storyState // undefined means we just booted
// TODO STORY_STATE_MENU
let STORY_STATE_INITIAL
let STORY_STATE_WORDS = 1
let STORY_STATE_START_GAME = 2
let STORY_STATE_GAME = 3
let showWordsIndex = -1
let showWordsTime = 3
let showingTheseWordsUntil
/** returns truthy if should skip frame */
let advanceStory = (isFirstFrame, [wordsList, initialize, shouldGoToNext] = story[savedGame]) => {
    if (!storyState || isFirstFrame) {
        storyState = STORY_STATE_WORDS;
        if (!self.production && skipStory) {
            storyState = STORY_STATE_START_GAME
        }
    } else if (storyState == STORY_STATE_WORDS) {
        if (showWordsIndex < 0 || showingTheseWordsUntil < TIME) {
            showWordsIndex++
            showingTheseWordsUntil = TIME + showWordsTime
        }
        if (wordsList[showWordsIndex]) {
            assert(() => !wordsList[showWordsIndex].split('\n').some(line => line.length > 35))
            drawText(wordsList[showWordsIndex], 0.1, 0.1)
        } else {
            // Done with the words
            storyState = STORY_STATE_START_GAME
            showWordsIndex = -1
        }
    } else if (storyState == STORY_STATE_START_GAME) {
        initialize()
        storyState = STORY_STATE_GAME
    } else {
        assert(() => storyState == STORY_STATE_GAME)
        if (shouldGoToNext()) {
            savedGame++
            saveGame()
            storyState = STORY_STATE_INITIAL;
        }
    }
    return storyState != STORY_STATE_GAME
}
