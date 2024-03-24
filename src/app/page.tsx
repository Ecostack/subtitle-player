"use client"
import {SubtitlePlayer} from "@/app/SubtitlePlayer";
import {useCallback, useEffect, useState} from "react";


function FileUploader({onFileSelect}: { onFileSelect: (value: string) => void }) {
    const handleFileInput = (e: any) => {
        // Handle file reading
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                const content = e.target.result;
                onFileSelect(content as string);
            };
            reader.readAsText(file);
        }
    };

    return (
        <div className="file-uploader-container">
            <div  style={{fontSize:'3em', color:"white", marginBottom:16}}>Subtitle Player</div>
            <div style={{fontSize:'1em', color:"wheat",marginBottom:8}}>Upload your SRT file to play the subtitle along a video!</div>
            <label htmlFor="file-upload" className="file-upload-label">
                Choose your file or drop it here
            </label>
            <input type="file" accept=".srt" onChange={handleFileInput} className="file-input"/>
        </div>
    );
}

const LOCAL_STORAGE_KEY_SUBTITLES = 'subtitles'

export default function Page() {
    const [srtContent, setSrtContent] = useState('');

    useEffect(() => {
        const subtitles = localStorage.getItem(LOCAL_STORAGE_KEY_SUBTITLES)
        if (subtitles) {
            setSrtContent(subtitles)
        }
    }, []);

    const setSubtitles = useCallback((content: string) => {
        localStorage.setItem(LOCAL_STORAGE_KEY_SUBTITLES,content)
        setSrtContent(content)
    },[])


    const handleReset = () => {
        localStorage.removeItem(LOCAL_STORAGE_KEY_SUBTITLES)
        setSrtContent('')
    }

    return <>
        {!srtContent && <FileUploader onFileSelect={setSubtitles}/>}
        {srtContent && <SubtitlePlayer reset={handleReset} subtitles={srtContent}/>}
    </>
}
