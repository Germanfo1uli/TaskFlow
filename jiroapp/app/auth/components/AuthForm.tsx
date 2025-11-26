import { Form, Field, FormikHelpers } from 'formik'
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowRight } from 'react-icons/fa'
import { FormValues } from '../types/auth'
import { useAuth } from '../hooks/useAuth'
import styles from './AuthForm.module.css'

interface AuthFormProps {
    isLogin: boolean
    errors: any
    touched: any
    isSubmitting: boolean
}

const AuthForm = ({ isLogin, errors, touched, isSubmitting }: AuthFormProps) => {
    const { showPassword, showConfirmPassword, togglePasswordVisibility, toggleConfirmPasswordVisibility } = useAuth()

    return (
        <Form className={styles.authForm}>
            {!isLogin && (
                <div className={styles.formGroup}>
                    <label htmlFor="name" className={styles.formLabel}>
                        <FaUser className={styles.inputIcon} /> Имя
                    </label>
                    <Field
                        type="text"
                        name="name"
                        className={`${styles.formInput} ${errors.name && touched.name ? styles.error : ''}`}
                        placeholder="Введите ваше имя"
                    />
                    {errors.name && touched.name && (
                        <div className={styles.errorMessage}>{errors.name}</div>
                    )}
                </div>
            )}

            <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.formLabel}>
                    <FaEnvelope className={styles.inputIcon} /> Email
                </label>
                <Field
                    type="email"
                    name="email"
                    className={`${styles.formInput} ${errors.email && touched.email ? styles.error : ''}`}
                    placeholder="Введите ваш email"
                />
                {errors.email && touched.email && (
                    <div className={styles.errorMessage}>{errors.email}</div>
                )}
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="password" className={styles.formLabel}>
                    <FaLock className={styles.inputIcon} /> Пароль
                </label>
                <div className={styles.passwordInputWrapper}>
                    <Field
                        type={showPassword ? "text" : "password"}
                        name="password"
                        className={`${styles.formInput} ${errors.password && touched.password ? styles.error : ''}`}
                        placeholder="Введите ваш пароль"
                    />
                    <button
                        type="button"
                        className={styles.passwordToggle}
                        onClick={togglePasswordVisibility}
                    >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                </div>
                {errors.password && touched.password && (
                    <div className={styles.errorMessage}>{errors.password}</div>
                )}
            </div>

            {!isLogin && (
                <div className={styles.formGroup}>
                    <label htmlFor="confirmPassword" className={styles.formLabel}>
                        <FaLock className={styles.inputIcon} /> Подтвердите пароль
                    </label>
                    <div className={styles.passwordInputWrapper}>
                        <Field
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            className={`${styles.formInput} ${errors.confirmPassword && touched.confirmPassword ? styles.error : ''}`}
                            placeholder="Подтвердите ваш пароль"
                        />
                        <button
                            type="button"
                            className={styles.passwordToggle}
                            onClick={toggleConfirmPasswordVisibility}
                        >
                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                    {errors.confirmPassword && touched.confirmPassword && (
                        <div className={styles.errorMessage}>{errors.confirmPassword}</div>
                    )}
                </div>
            )}

            {isLogin && (
                <div className={styles.forgotPassword}>
                    <button type="button" className={styles.forgotPasswordButton}>
                        Забыли пароль?
                    </button>
                </div>
            )}

            <div className={styles.formActions}>
                <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <div className={styles.loadingSpinner}></div>
                    ) : (
                        <>
                            {isLogin ? 'Войти' : 'Зарегистрироваться'}
                            <FaArrowRight className={styles.submitIcon} />
                        </>
                    )}
                </button>
            </div>
        </Form>
    )
}

export default AuthForm