import React, { createContext, useEffect, useState } from 'react'

export const ControlsContext = createContext()

const demoFiles = [
    '/images/apples.jpg',
    '/images/chicago.jpg',
    '/images/girl.jpg',
]

export const ControlsProvider = ({ children }) => {
    const [demoFile, setDemoFile] = useState(demoFiles[0])
    const [boxSize, setBoxSize] = useState(16)
    const [image, setImage] = useState(undefined)

    async function loadImage(url) {
        const image = new Image()
        await new Promise(resolve => image.onload = resolve, image.src = url)
        setImage(image)
    }

    useEffect(() => {
        if (demoFile) {
            loadImage(demoFile)
        }
    }, [demoFile])

    const value = {
        demoFiles,
        demoFile,
        setDemoFile,

        boxSize,
        setBoxSize,

        image,
        loadImage,
    }

    return (
        <ControlsContext.Provider value={ value }>
            {children}
        </ControlsContext.Provider>
    )
};
