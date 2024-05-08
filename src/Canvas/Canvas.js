import React, { useContext, useEffect } from 'react'
import QCompress from '../qcompress'
import styles from './Canvas.module.scss'
import { ControlsContext } from '../Controls/ControlsContext'

export default function Canvas() {
    const { demoFile, boxSize, image } = useContext(ControlsContext)
    const canvasRef = React.createRef()

    async function drawImage( element) {
        let ctx = element.getContext('2d')

        element.width = image.width
        element.height = image.height
        ctx.drawImage(image, 0, 0)
    }
    
    async function init() {
        await drawImage(canvasRef.current)
        drawCompressed(canvasRef.current)
    }

    function drawCompressed(element) {
        let ctx = element.getContext('2d')

        let imageData = ctx.getImageData(0, 0, element.width, element.height)

        let compressor = new QCompress(boxSize)
        let newImageData = compressor.compress(ctx, imageData)

        ctx.putImageData(newImageData, 0, 0)
    }

    useEffect(() => {
        init()
    }, [image, boxSize])

    return <section className={ styles.section }>
        <canvas className={ styles.canvas } ref={ canvasRef } />
    </section>

}