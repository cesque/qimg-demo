export default class QCompress {
    constructor(boxSize) {
        this.boxSize = boxSize || 16
    }

    splitIntoBoxes(imageData) {
        const size = {
            width: this.boxSize * Math.floor(imageData.width / this.boxSize),
            height: this.boxSize * Math.floor(imageData.height / this.boxSize),
        }

        const data = []

        for(let y = 0; y < size.height / this.boxSize; y++) {
            for(let x = 0; x < size.width / this.boxSize; x++) {
                const xStart = x * this.boxSize
                const yStart = y * this.boxSize

                const box = {
                    x,
                    y,
                    size: this.boxSize,
                    data: [],
                }

                for(let y1 = 0; y1 < this.boxSize; y1++) {
                    for(let x1 = 0; x1 < this.boxSize; x1++) {
                        const realY = yStart + y1
                        const realX = xStart + x1

                        const index = (realY * imageData.width) + realX

                        const pixel = {
                            x: x1,
                            y: y1,
                            color: {
                                r: imageData.data[index * 4],
                                g: imageData.data[index * 4 + 1],
                                b: imageData.data[index * 4 + 2],
                            }
                        }
                        
                        box.data.push(pixel)
                    }
                }

                data.push(box)
            }
        }

        return {
            size,
            data,
        }
    }

    getLuminance(color) {
        const r = color.r
        const g = color.g
        const b = color.b
        return Math.sqrt((0.241 * r * r) + (0.691 * g * g) + (0.068 * b * b)) / 255
    }

    compressBoxes(boxes) {
        for(const box of boxes.data) {
            // --- mean
            const avgLuminance = box.data.reduce((p, c) => p + this.getLuminance(c.color), 0) / box.data.length
            // --- median
            // let luminances = box.data.map(pixel => this.getLuminance(pixel.color))
            // luminances.sort()
            // let avgLuminance = (luminances[Math.floor(luminances.length / 2)] + luminances[Math.ceil(luminances.length / 2)]) / 2

            const totals = {
                light: { r: 0, g: 0, b: 0, n: 0},
                dark: { r: 0, g: 0, b: 0, n: 0 },
            }
            // if(n++ > 10) return
            for(const pixel of box.data) {
                const luminance = this.getLuminance(pixel.color)
                // console.log(luminance)

                const type = luminance >= avgLuminance ? 'light' : 'dark'
                totals[type].n++
                totals[type].r += pixel.color.r
                totals[type].g += pixel.color.g
                totals[type].b += pixel.color.b
            }

            const averages = { light: {}, dark: {} }
            averages.light.r = Math.floor(totals.light.r / totals.light.n)
            averages.light.g = Math.floor(totals.light.g / totals.light.n)
            averages.light.b = Math.floor(totals.light.b / totals.light.n)
            averages.dark.r = Math.floor(totals.dark.r / totals.dark.n)
            averages.dark.g = Math.floor(totals.dark.g / totals.dark.n)
            averages.dark.b = Math.floor(totals.dark.b / totals.dark.n)

            for(const pixel of box.data) {
                const luminance = this.getLuminance(pixel.color)

                const type = luminance >= avgLuminance ? 'light' : 'dark'

                pixel.color.r = averages[type].r
                pixel.color.g = averages[type].g
                pixel.color.b = averages[type].b
            }
        }

        return boxes
    }

    drawBoxes(boxes, target) {
        for(const box of boxes.data) {
            for(const pixel of box.data) {
                const x = (box.x * this.boxSize) + pixel.x
                const y = (box.y * this.boxSize) + pixel.y

                // let index = (boxes.size.width * y) + x
                const index = (target.width * y) + x

                target.data[index * 4] = pixel.color.r 
                target.data[index * 4 + 1] = pixel.color.g
                target.data[index * 4 + 2] = pixel.color.b
                target.data[index * 4 + 3] = 255

            }
        }
    }

    compress(ctx, imageData) {
        const result = ctx.createImageData(imageData.width, imageData.height)

        const boxes = this.splitIntoBoxes(imageData)
        const compressed = this.compressBoxes(boxes)
        this.drawBoxes(compressed, result)

        return result
    }
}