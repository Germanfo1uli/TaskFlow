import React from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { Sprint } from '../types/types'
import styles from './EditSprintModal.module.css'
import { FaTimes } from 'react-icons/fa'

interface EditSprintModalProps {
    sprint: Sprint;
    isOpen: boolean;
    onClose: () => void;
    onSave: (sprintId: string | number, data: EditSprintFormValues) => void;
}

export interface EditSprintFormValues {
    name: string;
    goal: string;
    startDate: string;
    endDate: string;
}

const EditSprintModal = ({ sprint, isOpen, onClose, onSave }: EditSprintModalProps) => {
    if (!isOpen) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const validationSchema = Yup.object({
        name: Yup.string().required('Название спринта обязательно'),
        goal: Yup.string(),
        startDate: Yup.date()
            .nullable()
            .required('Дата начала обязательна')
            .min(today, 'Дата начала не может быть раньше текущей даты'),
        endDate: Yup.date()
            .nullable()
            .required('Дата окончания обязательна')
            .min(today, 'Дата окончания не может быть раньше текущей даты')
            .min(
                Yup.ref('startDate'),
                'Дата окончания должна быть позже даты начала'
            )
    });

    const formatDateForInput = (date: Date | null) => {
        if (!date) return '';
        return date.toISOString().split('T')[0];
    };

    const formik = useFormik({
        initialValues: {
            name: sprint.name,
            goal: sprint.goal || '',
            startDate: formatDateForInput(sprint.startDate),
            endDate: formatDateForInput(sprint.endDate)
        },
        validationSchema,
        onSubmit: (values) => {
            onSave(sprint.id, values);
            onClose();
        },
    });

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Изменить спринт: {sprint.name}</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={formik.handleSubmit} className={styles.createSprintForm}>
                    <div className={styles.modalBody}>
                        <div className={styles.formGroup}>
                            <label htmlFor="name" className={styles.label}>Название спринта</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                className={`${styles.input} ${formik.touched.name && formik.errors.name ? styles.error : ''}`}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.name}
                            />
                            {formik.touched.name && formik.errors.name ? (
                                <span className={styles.errorText}>{formik.errors.name}</span>
                            ) : null}
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="goal" className={styles.label}>Цель спринта</label>
                            <textarea
                                id="goal"
                                name="goal"
                                className={styles.textarea}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.goal}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="startDate" className={styles.label}>Дата начала</label>
                            <input
                                id="startDate"
                                name="startDate"
                                type="date"
                                className={`${styles.input} ${formik.touched.startDate && formik.errors.startDate ? styles.error : ''}`}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.startDate}
                            />
                            {formik.touched.startDate && formik.errors.startDate ? (
                                <span className={styles.errorText}>{formik.errors.startDate as string}</span>
                            ) : null}
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="endDate" className={styles.label}>Дата окончания</label>
                            <input
                                id="endDate"
                                name="endDate"
                                type="date"
                                className={`${styles.input} ${formik.touched.endDate && formik.errors.endDate ? styles.error : ''}`}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.endDate}
                            />
                            {formik.touched.endDate && formik.errors.endDate ? (
                                <span className={styles.errorText}>{formik.errors.endDate as string}</span>
                            ) : null}
                        </div>
                    </div>

                    <div className={styles.modalActions}>
                        <button type="button" className={styles.cancelButton} onClick={onClose}>
                            Отмена
                        </button>
                        <button 
                            type="submit" 
                            className={styles.saveButton}
                            disabled={!formik.isValid || !formik.dirty}
                        >
                            Сохранить
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default EditSprintModal
