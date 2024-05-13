import styles from './Controls.module.css'

import { useContext, useMemo, useRef } from 'react'
import { ControlsContext } from './ControlsContext'

export default function Controls() {
    const {
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
        loadImage,
        setImage,

        compressedImage,
        setCompressedImage,
    } = useContext(ControlsContext)

    const fileRef = useRef()

    function getDemoFileDropdownOptions() {
        return <>
            <option disabled value="---">---</option>
            <optgroup label="demo files">
                { demoFiles.map(fileName => {
                    const fileNameParts = fileName.split('/')
                    const name = fileNameParts.pop()

                    return <option value={fileName}
                        key={fileName}
                    >
                        { name }
                    </option>
                }) }
            </optgroup>
        </>
    }

    function onDemoFileChange(e) {
        const value = e.target.value
        setDemoFile(value)

        if (fileRef.current) fileRef.current.value = null
    }

    function onBoxSizeChange(e) {
        const value = +e.target.value
        const calculatedBoxSize = 2 ** (value + 3)
        setBoxSize(calculatedBoxSize)
    }

    function onGradientScaleChange(e) {
        const value = +e.target.value
        setGradientScale(value)
    }

    function readDataFile(file, newAlgorithm) {
        try {
            let reader = new FileReader()

            reader.addEventListener('load', loadEvent => {
                const data = loadEvent.target.result
                const bytes = new Uint8Array(data)

                const newAlgorithmInstance = new algorithms[newAlgorithm]()

                const compressedImage = newAlgorithmInstance.fromBuffer(bytes)

                selectAlgorithm(newAlgorithm)
                setImage(undefined)
                setCompressedImage(compressedImage)

                setDemoFile('---')
            })

            reader.readAsArrayBuffer(file)
        } catch(e) {
            alert(e)
        }
    }

    function onFileInput(e) {
        const file = e.target.files[0]
        const extension = file.name.split('.').pop()

        const fileExtensionsForCompressed = Object.keys(algorithmFileExtensions)

        if (fileExtensionsForCompressed.includes(extension)) {
            const algorithmFromFile = algorithmFileExtensions[extension]

            console.log(`using strategy '${ algorithmFromFile }' to load file`)
            readDataFile(file, algorithmFromFile)
        } else {
            loadImage(URL.createObjectURL(file))

            setDemoFile('---')
            if (fileRef.current) fileRef.current.value = null
        }
    }

    function download() {
        const content = compressedImage.toBuffer()

        const a = document.createElement('a')
        const blob = new Blob([content])
        a.href = URL.createObjectURL(blob)

        a.download = `image.${ algorithm.getFileExtensions()[0] }`
        a.click()
    }

    const fileAccept = useMemo(() => {
        const result = []

        console.log(algorithmFileExtensions)
        result.push(...Object.keys(algorithmFileExtensions).map(extension => `.${ extension }`))
        
        result.push('image/png')
        result.push('image/jpeg')

        return result
    }, [algorithms])

    const showGradientScale = image
        && (selectedAlgorithmName == 'gradimg' || selectedAlgorithmName == 'gradrgb')

    return <section className={ styles.controls }>
        <div className={ styles.row }>
            <div className={ styles.item }>
                <label htmlFor="demo-file">demo file</label>
                <select id="demo-file" name="demo-file" onChange={ onDemoFileChange } value={ demoFile }>
                    { getDemoFileDropdownOptions() }
                </select>   
            </div>  
    
            <div className={ styles.item }>
                <input ref={ fileRef } type="file" id="file-input" onChange={onFileInput} accept={ fileAccept.join(',') } />
            </div>

            <div className={ styles.item }>
                <button type="button" onClick={ download }>Download</button>
            </div>
        </div>

        <div className={ styles.row }>
            <div className={ styles.item }>
                <label htmlFor="algorithm">compression algorithm</label>
                <select id="algorithm" name="algorithm" onChange={ e => selectAlgorithm(e.target.value) } value={ selectedAlgorithmName } disabled={ !image }>
                    { Object.keys(algorithms).map(name => <option value={name} key={name}>{ name }</option>) }
                </select>   
            </div>

            { image && <div className={ styles.item }>
                <label htmlFor="box-size">box size</label>
                <input type="range" id="box-size" name="box-size" list="markers" min="0" max="4" step="1" onChange={ onBoxSizeChange } value={ Math.log2(boxSize) - 3 } />
                <p className={ styles.boxSize }>{ boxSize }</p>

                <datalist id="markers">
                    <option value="0"></option>
                    <option value="1"></option>
                    <option value="2"></option>
                    <option value="3"></option>
                    <option value="4"></option>
                </datalist>
            </div> }

            { showGradientScale && <div className={ styles.item }>
                <label htmlFor="gradient-scale">gradient scale</label>
                <input type="range" id="gradient-scale" name="gradient-scale" min="0.05" max="1" step="0.05" onChange={ onGradientScaleChange } value={ gradientScale } />
                <p className={ styles.gradientScale }>×{ gradientScale }</p>
                <button type="button" onClick={ () => setGradientScale(0.5) }>Reset scale</button>
            </div> }
        </div>
    </section>
}