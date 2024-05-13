import { GradImg, QImg } from 'image-compression-algorithms';
import React, { createContext, useEffect, useMemo, useState } from 'react'

export const ControlsContext = createContext()

const demoFiles = [
    '/images/apples.jpg',
    '/images/chicago.jpg',
    '/images/girl.jpg',
]

const algorithms = {
    qimg: QImg,
    gradimg: GradImg,
}

export const ControlsProvider = ({ children }) => {
    const [selectedAlgorithmName, setSelectedAlgorithmName] = useState(Object.keys(algorithms)[0])
    const [demoFile, setDemoFile] = useState(demoFiles[0])
    const [boxSize, setBoxSize] = useState(32)
    const [gradientScale, setGradientScale] = useState(0.5)
    const [image, setImage] = useState(undefined)
    const [compressedImage, setCompressedImage] = useState(undefined)

    const algorithm = useMemo(() => {
        return new algorithms[selectedAlgorithmName]
    }, [selectedAlgorithmName])

    async function loadImage(url) {
        const image = new Image()
        await new Promise(resolve => image.onload = resolve, image.src = url)

        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        canvas.width = image.width
        canvas.height = image.height
        context.drawImage(image, 0, 0)

        const imageData = context.getImageData(0, 0, image.width, image.height)
        setImage(imageData)
    }

    useEffect(() => {
        if (demoFile && demoFile != '---') {
            loadImage(demoFile)
        }
    }, [demoFile])

    useEffect(() => {
        if (!image) return

        const compressed = algorithm.compress(image, {
            gradientScale,
            boxSize,
        })

        setCompressedImage(compressed)
    }, [image, selectedAlgorithmName, boxSize, gradientScale])

    function selectAlgorithm(name) {
        if (algorithms.hasOwnProperty(name)) setSelectedAlgorithmName(name)
    }

    const algorithmFileExtensions = useMemo(() => {
        const results = {}

        for (const [key, Algorithm] of Object.entries(algorithms)) {
            const instance = new Algorithm()
            const extensions = instance.getFileExtensions()

            for (const extension of extensions) {
                results[extension] = key
            }
        }

        return results
    }, [algorithms])

    const value = {
        algorithms,
        selectedAlgorithmName,
        selectAlgorithm,
        algorithm,
        algorithmFileExtensions,

        demoFiles,
        demoFile,
        setDemoFile,

        boxSize,
        setBoxSize,

        gradientScale,
        setGradientScale,

        image,
        setImage,
        loadImage,

        setCompressedImage,
        compressedImage,
    }

    return (
        <ControlsContext.Provider value={ value }>
            {children}
        </ControlsContext.Provider>
    )
};
