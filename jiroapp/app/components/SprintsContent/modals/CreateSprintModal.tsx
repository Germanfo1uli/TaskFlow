import React from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { Issue, IssueStatus } from '../types/types'
import styles from './CreateSprintModal.module.css'
import { FaTimes } from 'react-icons/fa'

interface CreateSprintModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (data: CreateSprintFormValues) => void;
    backlogIssues: Issue[];
}

export interface CreateSprintFormValues {
    name: string;
    goal: string;
    startDate: string;
    endDate: string;
    selectedIssues: string[];
}

const CreateSprintModal = ({ isOpen, onClose, onCreate, backlogIssues }: CreateSprintModalProps) => {
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

    const formik = useFormik({
        initialValues: {
            name: '',
            goal: '',
            startDate: '',
            endDate: '',
            selectedIssues: [] as string[]
        },
        validationSchema,
        onSubmit: (values) => {
            onCreate(values);
            onClose();
        },
    });

    const handleToggleIssue = (issueId: string | number) => {
        const currentSelected = formik.values.selectedIssues;
        const idStr = String(issueId);
        if (currentSelected.includes(idStr)) {
            formik.setFieldValue('selectedIssues', currentSelected.filter(id => id !== idStr));
        } else {
            formik.setFieldValue('selectedIssues', [...currentSelected, idStr]);
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Создать спринт</h2>
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
                                placeholder="Например: Спринт 1"
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
                                placeholder="Чего мы хотим достичь в этом спринте?"
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

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Добавить задачи из бэклога</label>
                            <div className={backlogIssues.length > 2 ? `${styles.taskList} ${styles.scrollableTaskList}` : styles.taskList}>
                                {backlogIssues.length > 0 ? (
                                    backlogIssues.map(issue => (
                                        <div 
                                            key={issue.id} 
                                            className={styles.taskItem} 
                                            onClick={() => handleToggleIssue(issue.id)}
                                        >
                                            <input
                                                type="checkbox"
                                                className={styles.checkbox}
                                                checked={formik.values.selectedIssues.includes(String(issue.id))}
                                                readOnly
                                            />
                                            <span className={styles.taskTitle}>{issue.title}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className={styles.emptyMessage}>Нет задач в бэклоге</div>
                                )}
                            </div>
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
                            Создать спринт
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CreateSprintModal
