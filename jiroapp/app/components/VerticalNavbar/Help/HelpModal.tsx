'use client'

import { FaTimes } from 'react-icons/fa'
import Image from 'next/image'
import styles from './HelpModal.module.css'
import helpCat from './helpCat.jpg'

interface HelpModalProps {
    onClose: () => void
}

const HelpModal = ({ onClose }: HelpModalProps) => {
    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.helpModal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose}>
                    <FaTimes className={styles.closeIcon} />
                </button>

                <div className={styles.modalContent}>
                    <div className={styles.catContainer}>
                        <div className={styles.catImageWrapper}>
                            <Image
                                src={helpCat}
                                alt="Грустный кот в кружке"
                                width={200}
                                height={200}
                                className={styles.catImage}
                                priority
                            />
                        </div>
                    </div>

                    <div className={styles.helpContent}>
                        <h2 className={styles.helpTitle}>Помогите мне</h2>
                        <p className={styles.helpText}>
                            Я очень устал, босс.<br />
                            Здесь я когда-нибудь напишу для вас
                            руководство по этому сайту
                            (нет)
                        </p>
                        <div className={styles.helpActions}>
                            <button className={styles.helpButton}>
                                Спасибо, Котик!!!
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HelpModal