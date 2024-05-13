import { createRef, useContext, useLayoutEffect } from 'react'
import styles from './Canvas.module.css'
import { ControlsContext } from '../Controls/ControlsContext'

export default function Canvas() {
    const {
        image,
        compressedImage
    } = useContext(ControlsContext)
    const canvasRef = createRef()

    async function drawImage(element) {
        if (!image || !canvasRef.current) return

        let ctx = element.getContext('2d')
        ctx.willReadFrequently = true

        element.width = image.width
        element.height = image.height
        ctx.putImageData(image, 0, 0)
    }
    
    async function init() {
        if (image) await drawImage(canvasRef.current)
        drawCompressed(canvasRef.current)
    }

    function drawCompressed(element) {
        if (!compressedImage || !canvasRef.current) return

        const newImageData = compressedImage.toImageData()

        if (!image) {
            element.width = newImageData.width
            element.height = newImageData.height
        }

        const ctx = element.getContext('2d')
        ctx.willReadFrequently = true

        ctx.fillStyle = 'black'
        ctx.fillRect(0, 0, element.width, element.height)

        ctx.putImageData(newImageData, 0, 0)
    }

    useLayoutEffect(() => {
        init()
    }, [compressedImage])

    return <section className={ styles.section }>
        <canvas className={ styles.canvas } ref={ canvasRef } />
    </section>

}