import { Formik, Form, Field, ErrorMessage, useFormikContext } from 'formik';
import { FaSave, FaEdit } from 'react-icons/fa';
import { ProfileFormData } from '../types/profile.types';
import { profileSchema } from '../validation/profileSchema';
import styles from './ProfileForm.module.css';

interface ProfileFormProps {
    initialData: ProfileFormData;
    onSubmit: (data: ProfileFormData) => Promise<void>;
    isLoading: boolean;
}

const EditButton = () => {
    const { setFieldValue, values } = useFormikContext();

    const enableEditing = () => {
        const form = document.querySelector('form');
        const inputs = form?.querySelectorAll('input, textarea');
        inputs?.forEach(input => {
            input.removeAttribute('disabled');
            input.classList.remove(styles.disabled);
        });


        setFieldValue('__editing', true);
    };

    return (
        <button
            type="button"
            className={styles.editButton}
            onClick={enableEditing}
        >
            <FaEdit className={styles.editIcon} />
            Редактировать
        </button>
    );
};

export const ProfileForm = ({ initialData, onSubmit, isLoading }: ProfileFormProps) => {
    const initialValues = {
        ...initialData,
        __editing: false
    };

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={profileSchema}
            onSubmit={async (values, { setSubmitting, resetForm }) => {
                const { __editing, ...formData } = values;
                await onSubmit(formData);
                setSubmitting(false);
                resetForm({ values: { ...formData, __editing: false } });
            }}
            enableReinitialize
        >
            {({ isSubmitting, isValid, dirty, values, resetForm }) => (
                <div className={styles.profileFormContainer}>
                    <div className={styles.formHeader}>
                        <h3>Информация профиля</h3>
                        {!values.__editing && !dirty && (
                            <EditButton />
                        )}
                    </div>

                    <Form className={styles.profileForm}>
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label htmlFor="name">Полное имя</label>
                                <Field
                                    id="name"
                                    name="name"
                                    type="text"
                                    disabled={!values.__editing}
                                    className={!values.__editing ? styles.disabled : ''}
                                />
                                <ErrorMessage name="name" component="div" className={styles.errorMessage} />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="email">Email</label>
                                <Field
                                    id="email"
                                    name="email"
                                    type="email"
                                    disabled={!values.__editing}
                                    className={!values.__editing ? styles.disabled : ''}
                                />
                                <ErrorMessage name="email" component="div" className={styles.errorMessage} />
                            </div>

                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                <label htmlFor="bio">О себе</label>
                                <Field
                                    id="bio"
                                    name="bio"
                                    as="textarea"
                                    disabled={!values.__editing}
                                    className={!values.__editing ? styles.disabled : ''}
                                    rows={3}
                                    placeholder="Расскажите о себе..."
                                />
                                <ErrorMessage name="bio" component="div" className={styles.errorMessage} />
                            </div>
                        </div>

                        {values.__editing && (
                            <div className={styles.formActions}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        resetForm();
                                        const inputs = document.querySelectorAll('input, textarea');
                                        inputs.forEach(input => {
                                            input.setAttribute('disabled', 'true');
                                            input.classList.add(styles.disabled);
                                        });
                                    }}
                                    className={styles.cancelButton}
                                    disabled={isSubmitting}
                                >
                                    Отмена
                                </button>
                                <button
                                    type="submit"
                                    className={styles.saveButton}
                                    disabled={isSubmitting || !isValid}
                                >
                                    <FaSave className={styles.saveIcon} />
                                    {isSubmitting ? 'Сохранение...' : 'Сохранить'}
                                </button>
                            </div>
                        )}
                    </Form>
                </div>
            )}
        </Formik>
    );
};