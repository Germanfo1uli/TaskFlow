import * as Yup from 'yup'

export const LoginSchema = Yup.object().shape({
    email: Yup.string()
        .email('Некорректный email')
        .required('Обязательное поле'),
    password: Yup.string()
        .min(6, 'Пароль должен содержать минимум 6 символов')
        .required('Обязательное поле')
})

export const RegisterSchema = Yup.object().shape({
    name: Yup.string()
        .min(2, 'Имя должно содержать минимум 2 символа')
        .required('Обязательное поле'),
    email: Yup.string()
        .email('Некорректный email')
        .required('Обязательное поле'),
    password: Yup.string()
        .min(6, 'Пароль должен содержать минимум 6 символов')
        .required('Обязательное поле'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Пароли должны совпадать')
        .required('Обязательное поле')
})