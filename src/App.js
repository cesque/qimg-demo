import styles from './App.module.css'
import React from 'react'

import Controls from './Controls/Controls'
import Canvas from './Canvas/Canvas'
import { ControlsProvider } from './Controls/ControlsContext'

export default function App() {
    return <main className={ styles.main }>
        <ControlsProvider>
            <Canvas />
            <Controls />
        </ControlsProvider>
    </main>
}
