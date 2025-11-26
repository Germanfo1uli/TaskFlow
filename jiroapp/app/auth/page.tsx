'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FaArrowRight, FaTasks } from 'react-icons/fa'
import { Formik, FormikHelpers } from 'formik'
import { FormValues } from './types/auth'
import { useAuth } from './hooks/useAuth'
import { LoginSchema, RegisterSchema } from './validations/validationSchemas'
import AuthForm from './components/AuthForm'
import SocialLogin from './components/SocialLogin'
import styles from './AuthPage.module.css'

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState<boolean>(true)
    const [isVisible, setIsVisible] = useState<boolean>(false)
    const router = useRouter()
    const { loginUser, registerUser } = useAuth()

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            router.push('/main')
        }

        const timer = setTimeout(() => {
            setIsVisible(true)
        }, 100)
        return () => clearTimeout(timer)
    }, [router])

    const handleBack = () => {
        setIsVisible(false)
        setTimeout(() => {
            router.push('/welcome')
        }, 600)
    }

    const handleSubmit = async (values: FormValues, { setSubmitting }: FormikHelpers<FormValues>) => {
        if (isLogin) {
            const result = await loginUser(values.email, values.password)
            if (result.success) {
                router.push('/main')
            } else {
                alert(result.message)
                setSubmitting(false)
            }
        } else {
            const result = await registerUser(values.name, values.email, values.password)
            if (result.success) {
                router.push('/main')
            } else {
                alert(result.message)
                setSubmitting(false)
            }
        }
    }

    const initialValues: FormValues = {
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    }

    return (
        <div className={styles.authContainer}>
            <div className={styles.authHeaderLogo}>
                <div className={styles.logo}>
                    <FaTasks className={styles.logoIcon} />
                    <span>TASKFLOW</span>
                </div>
            </div>

            <div className={`${styles.authContent} ${isVisible ? styles.visible : ''}`}>

                <button className={styles.backButton} onClick={handleBack}>
                    <FaArrowRight className={styles.backIcon} />
                    Назад
                </button>

                <div className={styles.authCard}>
                    <div className={styles.authHeader}>
                        <h2 className={styles.authTitle}>
                            {isLogin ? 'Вход в систему' : 'Регистрация'}
                        </h2>
                        <p className={styles.authSubtitle}>
                            {isLogin
                                ? 'Войдите, чтобы продолжить работу'
                                : 'Создайте аккаунт для начала работы'}
                        </p>
                    </div>

                    <div className={styles.authTabs}>
                        <button
                            className={`${styles.tabButton} ${isLogin ? styles.active : ''}`}
                            onClick={() => setIsLogin(true)}
                        >
                            Вход
                        </button>
                        <button
                            className={`${styles.tabButton} ${!isLogin ? styles.active : ''}`}
                            onClick={() => setIsLogin(false)}
                        >
                            Регистрация
                        </button>
                    </div>

                    <Formik
                        initialValues={initialValues}
                        validationSchema={isLogin ? LoginSchema : RegisterSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ errors, touched, isSubmitting }) => (
                            <AuthForm
                                isLogin={isLogin}
                                errors={errors}
                                touched={touched}
                                isSubmitting={isSubmitting}
                            />
                        )}
                    </Formik>

                    {isLogin && <SocialLogin />}
                </div>
            </div>
        </div>
    )
}

export default AuthPage