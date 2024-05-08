import styles from './Controls.module.css'

import { useContext } from 'react'
import { ControlsContext } from './ControlsContext'

export default function Controls() {
    const {
        demoFiles,
        demoFile,
        setDemoFile,

        boxSize,
        setBoxSize,

        loadImage,
    } = useContext(ControlsContext)

    function getDropdownOptions() {
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
    }

    function onBoxSizeChange(e) {
        const value = +e.target.value
        const calculatedBoxSize = 2 ** (value + 3)
        setBoxSize(calculatedBoxSize)
    }

    function onFileInput(e) {
        loadImage(URL.createObjectURL(e.target.files[0]))
        setDemoFile('---')
    }

    return <section className={ styles.controls }>
        <div className={ styles.item }>
            <label htmlFor="demo-file">demo file</label>
            <select id="demo-file" name="demo-file" onChange={ onDemoFileChange } value={ demoFile }>
                { getDropdownOptions() }
            </select>   
        </div>  
 
        <div className={ styles.item }>
            <input type="file" id="file-input" onChange={onFileInput} accept="image/png, image/jpeg" />
        </div>

        <div className={ styles.item }>
            <label for="box-size">box size</label>
            <input type="range" id="box-size" name="box-size" list="markers" min="0" max="4" step="1" onChange={ onBoxSizeChange } value={ Math.log2(boxSize) - 3 } />
            <p className={ styles.boxSize }>{ boxSize }</p>

            <datalist id="markers">
                <option value="0"></option>
                <option value="1"></option>
                <option value="2"></option>
                <option value="3"></option>
                <option value="4"></option>
            </datalist>
        </div>
    </section>
}