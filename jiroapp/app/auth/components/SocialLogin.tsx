import styles from './SocialLogin.module.css'

const SocialLogin = () => {
    return (
        <div className={styles.socialLogin}>
            <div className={styles.divider}>
                <span>или войдите с помощью</span>
            </div>
            <div className={styles.socialButtons}>
                <button className={`${styles.socialButton} ${styles.google}`}>
                    <span className={styles.socialIcon}>G</span>
                    Google
                </button>
                <button className={`${styles.socialButton} ${styles.github}`}>
                    <span className={styles.socialIcon}>GH</span>
                    GitHub
                </button>
            </div>
        </div>
    )
}

export default SocialLogin