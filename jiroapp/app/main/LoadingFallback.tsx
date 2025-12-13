import React from 'react'
import styles from './MainPage.module.css'

export const LoadingFallback: React.FC = () => (
    <div className={styles.loadingFallback}>
        <div className={styles.loadingContainer}>
            <div className={styles.pulseLoader}>
                <div className={styles.pulseDot}></div>
                <div className={styles.pulseDot}></div>
                <div className={styles.pulseDot}></div>
            </div>
            <p className={styles.loadingText}>Загружаем контент...</p>
        </div>
    </div>
)