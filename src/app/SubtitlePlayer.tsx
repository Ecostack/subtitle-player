"use client"
import {useEffect, useMemo, useState} from "react";


function parseTimeToMilliseconds(timeString: string) {
    // Regular expression to match hours, minutes, seconds, and milliseconds
    const regex = /(\d{2}):(\d{2}):(\d{2}),(\d{3})/;
    const match = timeString.match(regex);

    if (match) {
        // Extract hours, minutes, seconds, and milliseconds from the regex match
        const hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        const seconds = parseInt(match[3], 10);
        const milliseconds = parseInt(match[4], 10);

        // Convert everything to milliseconds and sum it up
        const totalMilliseconds = (hours * 3600 + minutes * 60 + seconds) * 1000 + milliseconds;
        return totalMilliseconds;
    }

    // Return null or throw an error if the format does not match
    throw new Error('Invalid time format');
    // return undefined; // Or throw new Error('Invalid time format');

}

function parseSubtitles(subtitlesRAW: string) {
    const blocks = subtitlesRAW.trim().split('\n\n')
    const subtitles = blocks.map(entry => {
        const lines = entry.split('\n')

        const index = parseInt(lines[0])

        const [startTime, endTime] = lines[1].split(' --> ').map(time => time.trim());
        // The rest is the subtitle text, join them back with a newline
        const text = lines.slice(2).join('\n');

        const startTimeMS = parseTimeToMilliseconds(startTime)
        const endTimeMS = parseTimeToMilliseconds(endTime)

        return {index, startTime, endTime, text, startTimeMS, endTimeMS};
    })
    return subtitles
}

function getSubtitleForTime(subtitles: ReturnType<typeof parseSubtitles>, time: number) {
    for (const subtitle of subtitles) {
        if (time >= subtitle.startTimeMS! && time <= subtitle.endTimeMS!) {
            return subtitle;
        }
    }
    return null
}

function leftPadString(str: string, length: number, char: string) {
    return char.repeat(length - str.length) + str

}

function secondsToTime(secondsRaw: number) {
    const hours = Math.floor(secondsRaw / 3600)
    let rest = secondsRaw % 3600
    const minutes = Math.floor(rest / 60)
    rest = rest % 60
    const seconds = Math.round(rest)
    return `${leftPadString(String(hours), 2, '0')}:${leftPadString(String(minutes), 2, '0')}:${leftPadString(String(seconds), 2, '0')}`
}


const TICK = 35
const BUTTON_SPEED = 1000
const SECOND_TO_MILLISECOND = 1000

const LOCAL_STORAGE_TIME_KEY = 'time'

export function SubtitlePlayer(props: { reset?: () => void; subtitles: string }) {
    const {subtitles: subtitlesRaw} = props
    const [timeMs1, setTimeMs] = useState<number | undefined>(undefined)

    const timeMsFixed = timeMs1 ?? 0

    const [isPaused, setIsPaused] = useState<boolean>(false)

    const timeSeconds = useMemo(() => Math.round(timeMsFixed / 1000), [timeMsFixed])

    const subtitles = useMemo(() => {
        return parseSubtitles(subtitlesRaw)
    }, [subtitlesRaw])

    const maxTime = useMemo(() => subtitles?.length > 0 ? subtitles[subtitles.length - 1].endTimeMS : 0, [subtitles])

    const maxTimeSeconds = useMemo(() => maxTime ? maxTime / 1000 : 0, [maxTime])

    const [storageLoaded, setStorageLoaded] = useState(false)

    useEffect(() => {
        const currentTime = localStorage.getItem(LOCAL_STORAGE_TIME_KEY)
        if (currentTime) {
            setTimeMs(old => {
                const result = parseInt(currentTime) * SECOND_TO_MILLISECOND
                return old === undefined ? result : old
            })
        }
        setStorageLoaded(true)
    }, []);

    useEffect(() => {
        if (!storageLoaded) {
            return
        }
        localStorage.setItem(LOCAL_STORAGE_TIME_KEY, String(timeSeconds))
    }, [timeSeconds, storageLoaded]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (!isPaused && storageLoaded) {
            timer = setInterval(() => {
                setTimeMs(old => ((old ?? 0) + TICK > maxTime) ? maxTime : (old ?? 0) + TICK)
            }, TICK);
        }

        return () => {
            if (timer) clearInterval(timer)
        }
    }, [isPaused, storageLoaded, maxTime]);


    const handleReset = () => {
        localStorage.removeItem(LOCAL_STORAGE_TIME_KEY)
        props.reset?.()
    }
    const handleTogglePause = () => {
        setIsPaused(old => !old);
    }

    const handleBack = () => {
        setTimeMs(old => (old ?? 0) < BUTTON_SPEED ? 0 : (old ?? 0) - BUTTON_SPEED)
    }

    const handleForward = () => {
        setTimeMs(old => ((old ?? 0) + BUTTON_SPEED > maxTime) ? maxTime : (old ?? 0) + BUTTON_SPEED)
    }

    const playTimeCurrent = useMemo(() => {
        return secondsToTime(timeSeconds)
    }, [timeSeconds])

    const playTimeEnd = useMemo(() => {
        return secondsToTime(maxTimeSeconds)
    }, [timeSeconds])

    useEffect(() => {
        const timeout = setTimeout(function () {
            window.scrollTo(0, 1);
        }, 1000);
        return () => {
            clearTimeout(timeout)
        }
    }, []);

    return <div style={{display: "flex", flexDirection: "column", height: '100%'}}>
        <div style={{display: "flex", height: '100%'}} onClick={handleTogglePause}>

            <div style={{
                display: "flex",
                alignItems: "center",
                flexGrow: 1,
                justifyContent: 'center',
                margin: "3%",
                fontSize: '3em',
                position:"relative"
            }}>
                {isPaused ? <div style={{position: "absolute", left:'15%', top:'15%'}}>
                    <button className={'button-back'} onClick={handleReset}>Back</button>
                </div> : null}
                <div>

                    {isPaused ? <span style={{
                        height: '100%',
                        fontSize: '2em',
                        userSelect:"none"
                    }}>⏸</span> : getSubtitleForTime(subtitles, timeMsFixed)?.text}</div>
            </div>
        </div>
        <div style={{width: '100%', display: "flex"}}>
            <div style={{display: "flex", alignItems: "center", flexGrow: 0, flexShrink: 0, margin: '3%',}}>
                <button className={"button-seek"} onClick={handleBack}>⏪
                </button>
            </div>
            <div style={{
                width: '100%',
                margin: '2%',
                display: "flex",
                flexDirection: "column",
                flexGrow: 1,
                justifyContent: 'center'
            }}>
                <input style={{width: '100%'}} type="range" min="0" max={maxTimeSeconds} value={timeSeconds}
                       onChange={(e) => {
                           setTimeMs(parseInt(e.target.value) * SECOND_TO_MILLISECOND)
                       }}
                />
                <div style={{display: "flex", justifyContent: "space-between", fontSize: '1.1em'}}>
                    <span>{playTimeCurrent}</span>
                    <span>{playTimeEnd}</span>
                </div>
            </div>
            <div style={{display: "flex", alignItems: "center", flexGrow: 0, flexShrink: 0, margin: '3%'}}>
                <button className={"button-seek"} onClick={handleForward}>⏩
                </button>
            </div>
        </div>
    </div>
}
