import { useState, useEffect } from 'react';
import {
    FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaUserShield,
    FaCheck, FaUserTag, FaLock, FaTasks, FaUsers, FaChartLine,
    FaEye, FaEyeSlash, FaKey, FaCrown, FaCode, FaBug,
    FaClipboardList, FaTags, FaPaperclip, FaComment,
    FaArrowRight, FaUserPlus, FaListAlt, FaHistory
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './RolesSection.module.css';
import { useRoles } from '../../hooks/useRoles';
import { Role, PermissionItem, RolesSectionProps } from '../../types/roles';

const RolesSection = ({ projectId }: RolesSectionProps) => {
    const { roles, loading, error, fetchRoles, createRole, updateRole, deleteRole } = useRoles(projectId);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [deletingRoleId, setDeletingRoleId] = useState<string | null>(null);

    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

    const permissionsList: PermissionItem[] = [
        { key: 'issue_view', label: 'Просмотр задач', description: 'Просмотр всех задач проекта', icon: <FaEye />, category: 'Задачи', entity: 'ISSUE', action: 'VIEW' },
        { key: 'issue_create', label: 'Создание задач', description: 'Создание новых задач', icon: <FaPlus />, category: 'Задачи', entity: 'ISSUE', action: 'CREATE' },
        { key: 'issue_edit', label: 'Редактирование задач', description: 'Изменение существующих задач', icon: <FaEdit />, category: 'Задачи', entity: 'ISSUE', action: 'EDIT' },
        { key: 'issue_delete', label: 'Удаление задач', description: 'Удаление задач', icon: <FaTrash />, category: 'Задачи', entity: 'ISSUE', action: 'DELETE' },
        { key: 'issue_assign', label: 'Назначение задач', description: 'Назначение людей на задачи', icon: <FaUserPlus />, category: 'Задачи', entity: 'ISSUE', action: 'ASSIGN' },
        { key: 'issue_take', label: 'Взять задачу', description: 'Стать ответственным за задачу', icon: <FaUserTag />, category: 'Задачи', entity: 'ISSUE', action: 'TAKE_ISSUE' },
        { key: 'issue_create_subtask', label: 'Создание подзадач', description: 'Создание подзадач', icon: <FaListAlt />, category: 'Задачи', entity: 'ISSUE', action: 'CREATE_SUBTASK' },
        { key: 'issue_transition_review', label: 'Перевод на ревью', description: 'Перевод задач из IN_PROGRESS в CODE_REVIEW и обратно', icon: <FaCode />, category: 'Задачи', entity: 'ISSUE', action: 'TRANSITION_CODE_REVIEW' },
        { key: 'issue_transition_qa', label: 'Перевод на QA', description: 'Перевод задач из CODE_REVIEW в QA и обратно', icon: <FaBug />, category: 'Задачи', entity: 'ISSUE', action: 'TRANSITION_QA' },
        { key: 'issue_transition_full', label: 'Полный перевод', description: 'Перевод задач между любыми статусами', icon: <FaArrowRight />, category: 'Задачи', entity: 'ISSUE', action: 'FULL_TRANSITION' },
        { key: 'sprint_manage', label: 'Управление спринтами', description: 'Создание, изменение и управление спринтами', icon: <FaClipboardList />, category: 'Спринты', entity: 'SPRINT', action: 'MANAGE' },
        { key: 'comment_create', label: 'Создание комментариев', description: 'Написание комментариев', icon: <FaComment />, category: 'Комментарии', entity: 'COMMENT', action: 'CREATE' },
        { key: 'comment_edit_own', label: 'Редактирование своих', description: 'Редактирование своих комментариев', icon: <FaEdit />, category: 'Комментарии', entity: 'COMMENT', action: 'EDIT_OWN' },
        { key: 'comment_delete_own', label: 'Удаление своих', description: 'Удаление своих комментариев', icon: <FaTrash />, category: 'Комментарии', entity: 'COMMENT', action: 'DELETE_OWN' },
        { key: 'attachment_create', label: 'Загрузка файлов', description: 'Загрузка вложений', icon: <FaPaperclip />, category: 'Вложения', entity: 'ATTACHMENT', action: 'CREATE' },
        { key: 'attachment_edit_own', label: 'Редактирование своих', description: 'Редактирование своих вложений', icon: <FaEdit />, category: 'Вложения', entity: 'ATTACHMENT', action: 'EDIT_OWN' },
        { key: 'attachment_delete_own', label: 'Удаление своих', description: 'Удаление своих вложений', icon: <FaTrash />, category: 'Вложения', entity: 'ATTACHMENT', action: 'DELETE_OWN' },
        { key: 'tag_create', label: 'Создание тегов', description: 'Создание новых тегов', icon: <FaPlus />, category: 'Теги', entity: 'TAG', action: 'CREATE' },
        { key: 'tag_edit', label: 'Редактирование тегов', description: 'Изменение существующих тегов', icon: <FaEdit />, category: 'Теги', entity: 'TAG', action: 'EDIT' },
        { key: 'tag_delete', label: 'Удаление тегов', description: 'Удаление тегов', icon: <FaTrash />, category: 'Теги', entity: 'TAG', action: 'DELETE' },
        { key: 'tag_apply', label: 'Применение тегов', description: 'Добавление тегов к задачам', icon: <FaTags />, category: 'Теги', entity: 'TAG', action: 'APPLY' },
        { key: 'analytics_view', label: 'Просмотр дашбордов', description: 'Просмотр дашбордов проекта', icon: <FaChartLine />, category: 'Система', entity: 'ANALYTICS', action: 'VIEW' },
        { key: 'logs_view', label: 'Просмотр логов', description: 'Просмотр истории действий проекта', icon: <FaHistory />, category: 'Система', entity: 'LOGS', action: 'VIEW' }
    ];

    const getPermissionFromItem = (item: PermissionItem) => ({
        entity: item.entity,
        action: item.action
    });

    const hasPermission = (role: Role, permissionItem: PermissionItem) => {
        return role.permissions.some(p =>
            p.entity === permissionItem.entity && p.action === permissionItem.action
        );
    };

    const getPermissionCount = (role: Role) => {
        return role.permissions.length;
    };

    const handleCreateRole = () => {
        const newRole: Role = {
            id: `temp_${Date.now()}`,
            name: 'Новая роль',
            description: 'Описание новой роли',
            permissions: [],
            memberCount: 0,
            isDefault: false,
            isOwner: false
        };
        setEditingRole(newRole);
        setIsCreating(true);
    };

    const handleEditRole = (role: Role) => {
        setEditingRole({ ...role });
        setIsCreating(false);
    };

    const handleSaveRole = async () => {
        if (!editingRole) return;

        try {
            if (isCreating) {
                const { id, memberCount, ...roleData } = editingRole;
                await createRole(roleData);
            } else {
                await updateRole(editingRole.id, editingRole);
            }
            setEditingRole(null);
        } catch (err) {
            console.error('Ошибка при сохранении роли:', err);
        }
    };

    const handleDeleteRole = (roleId: string) => {
        const role = roles.find(r => r.id === roleId);
        if (role?.isOwner) {
            alert('Нельзя удалить роль владельца');
            return;
        }
        if (role?.isDefault) {
            alert('Нельзя удалить роль по умолчанию');
            return;
        }
        setDeletingRoleId(roleId);
    };

    const confirmDelete = async () => {
        if (!deletingRoleId) return;
        try {
            await deleteRole(deletingRoleId);
            setDeletingRoleId(null);
        } catch (err) {
            console.error('Ошибка при удалении роли:', err);
        }
    };

    const handlePermissionToggle = (permissionItem: PermissionItem) => {
        if (!editingRole || editingRole.isOwner || editingRole.isDefault) return;

        const permission = getPermissionFromItem(permissionItem);
        const hasPerm = hasPermission(editingRole, permissionItem);

        let newPermissions;
        if (hasPerm) {
            newPermissions = editingRole.permissions.filter(p =>
                !(p.entity === permission.entity && p.action === permission.action)
            );
        } else {
            newPermissions = [...editingRole.permissions, permission];
        }

        setEditingRole({
            ...editingRole,
            permissions: newPermissions
        });
    };

    const toggleAllPermissions = (category: string, value: boolean) => {
        if (!editingRole || editingRole.isOwner || editingRole.isDefault) return;

        const categoryPermissions = permissionsList
            .filter(p => p.category === category)
            .map(p => getPermissionFromItem(p));

        let newPermissions = [...editingRole.permissions];

        if (value) {
            categoryPermissions.forEach(permission => {
                if (!newPermissions.some(p => p.entity === permission.entity && p.action === permission.action)) {
                    newPermissions.push(permission);
                }
            });
        } else {
            newPermissions = newPermissions.filter(permission =>
                !categoryPermissions.some(p =>
                    p.entity === permission.entity && p.action === permission.action
                )
            );
        }

        setEditingRole({
            ...editingRole,
            permissions: newPermissions
        });
    };

    const getPermissionGroups = () => {
        const groups: { [key: string]: PermissionItem[] } = {};
        permissionsList.forEach(permission => {
            if (!groups[permission.category]) {
                groups[permission.category] = [];
            }
            groups[permission.category].push(permission);
        });
        return groups;
    };

    const sortedRoles = [...roles].sort((a, b) => {
        if (a.isOwner && !b.isOwner) return -1;
        if (!a.isOwner && b.isOwner) return 1;
        return 0;
    });

    if (loading && roles.length === 0) {
        return <div className={styles.loading}>Загрузка ролей...</div>;
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    return (
        <div className={styles.rolesSection}>
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className={styles.sectionHeader}
            >
                <h2 className={styles.sectionTitle}>
                    <FaUserTag className={styles.titleIcon} />
                    Управление ролями
                </h2>
                <p className={styles.sectionSubtitle}>
                    Создавайте, редактируйте и настраивайте права доступа для разных ролей в проекте
                </p>
            </motion.div>

            <div className={styles.rolesContent}>
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className={styles.rolesHeader}
                >
                    <div className={styles.headerInfo}>
                        <h3 className={styles.headerTitle}>
                            <FaUserShield className={styles.headerIcon} />
                            Список ролей
                        </h3>
                        <p className={styles.headerDescription}>
                            {sortedRoles.length} ролей • {sortedRoles.find(r => r.isOwner)?.permissions.length || 0} доступов у владельца
                        </p>
                    </div>
                    <motion.button
                        className={styles.createButton}
                        onClick={handleCreateRole}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <FaPlus className={styles.buttonIcon} />
                        Создать роль
                    </motion.button>
                </motion.div>

                <div className={styles.rolesGrid}>
                    {sortedRoles.map((role, index) => (
                        <motion.div
                            key={role.id}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className={`${styles.roleCard} ${role.isOwner ? styles.ownerCard : ''}`}
                        >
                            <div className={styles.roleHeader}>
                                <div className={styles.roleTitle}>
                                    <h4 className={styles.roleName}>
                                        {role.isOwner ? (
                                            <FaCrown className={`${styles.roleIcon} ${styles.ownerIcon2}`} />
                                        ) : (
                                            <FaUserTag className={styles.roleIcon} />
                                        )}
                                        {role.name}
                                        {role.isOwner && (
                                            <span className={styles.ownerBadge}>Владелец</span>
                                        )}
                                        {role.isDefault && !role.isOwner && (
                                            <span className={styles.defaultBadge}>По умолчанию</span>
                                        )}
                                    </h4>
                                    <div className={styles.roleStats}>
                                        <span className={styles.statItem}>
                                            <FaUsers className={styles.statIcon} />
                                            {role.memberCount || 0} участников
                                        </span>
                                        <span className={styles.statItem}>
                                            <FaKey className={styles.statIcon} />
                                            {getPermissionCount(role)} доступов
                                        </span>
                                    </div>
                                </div>
                                <div className={styles.roleActions}>
                                    {!role.isOwner && !role.isDefault && (
                                        <motion.button
                                            className={styles.editButton}
                                            onClick={() => handleEditRole(role)}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            title="Редактировать роль"
                                        >
                                            <FaEdit />
                                        </motion.button>
                                    )}
                                    {!role.isOwner && !role.isDefault && (
                                        <motion.button
                                            className={styles.deleteButton}
                                            onClick={() => handleDeleteRole(role.id)}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            title="Удалить роль"
                                        >
                                            <FaTrash />
                                        </motion.button>
                                    )}
                                    {(role.isOwner || role.isDefault) && (
                                        <motion.button
                                            className={styles.viewButton}
                                            onClick={() => handleEditRole(role)}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            title="Просмотр роли"
                                        >
                                            <FaEye />
                                        </motion.button>
                                    )}
                                </div>
                            </div>

                            <p className={styles.roleDescription}>{role.description}</p>

                            <div className={styles.permissionsPreview}>
                                <div className={styles.permissionsHeader}>
                                    <span className={styles.permissionsTitle}>
                                        <FaLock className={styles.permissionsIcon} />
                                        Основные доступы
                                    </span>
                                </div>
                                <div className={styles.permissionsList}>
                                    {permissionsList.slice(0, 4).map(permission => (
                                        <div
                                            key={permission.key}
                                            className={`${styles.permissionItem} ${
                                                hasPermission(role, permission) ? styles.permissionActive : styles.permissionInactive
                                            }`}
                                        >
                                            {permission.icon}
                                            <span className={styles.permissionLabel}>
                                                {hasPermission(role, permission) ? permission.label : 'Нет доступа'}
                                            </span>
                                        </div>
                                    ))}
                                    {role.permissions.length > 4 && (
                                        <div className={styles.morePermissions}>
                                            +{role.permissions.length - 4} других доступов
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className={styles.permissionsInfo}
                >
                    <div className={styles.infoCard}>
                        <FaUserShield className={styles.infoIcon} />
                        <div className={styles.infoContent}>
                            <h4 className={styles.infoTitle}>Как работают роли?</h4>
                            <p className={styles.infoText}>
                                Роли определяют, какие действия могут выполнять участники в проекте.
                                Настройте права доступа для каждой роли в соответствии с обязанностями участников.
                            </p>
                            <ul className={styles.infoTips}>
                                <li>Владелец имеет полный доступ ко всем функциям</li>
                                <li>Роль владельца и роль по умолчанию нельзя редактировать или удалять</li>
                                <li>Изменения ролей применяются ко всем участникам с этой ролью</li>
                                <li>Роль по умолчанию назначается новым участникам</li>
                            </ul>
                        </div>
                    </div>
                </motion.div>
            </div>

            <AnimatePresence>
                {editingRole && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={styles.editModal}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className={styles.modalContent}
                        >
                            <div className={styles.modalHeader}>
                                <h3 className={styles.modalTitle}>
                                    {editingRole.isOwner ? (
                                        <FaCrown className={`${styles.modalIcon} ${styles.ownerIcon}`} />
                                    ) : (
                                        <FaUserTag className={styles.modalIcon} />
                                    )}
                                    {isCreating ? 'Создание новой роли' : (editingRole.isOwner || editingRole.isDefault ? 'Просмотр роли' : 'Редактирование роли')}
                                </h3>
                                <button
                                    className={styles.modalClose}
                                    onClick={() => setEditingRole(null)}
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <div className={styles.modalBody}>
                                <div className={styles.roleForm}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>
                                            Название роли *
                                        </label>
                                        <input
                                            type="text"
                                            className={styles.formInput}
                                            value={editingRole.name}
                                            onChange={(e) => setEditingRole({
                                                ...editingRole,
                                                name: e.target.value
                                            })}
                                            placeholder="Введите название роли"
                                            disabled={editingRole.isOwner || editingRole.isDefault}
                                        />
                                        {editingRole.isOwner && (
                                            <p className={styles.formHint}>
                                                Название роли владельца нельзя изменить
                                            </p>
                                        )}
                                        {editingRole.isDefault && !editingRole.isOwner && (
                                            <p className={styles.formHint}>
                                                Название роли по умолчанию нельзя изменить
                                            </p>
                                        )}
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>
                                            Описание роли
                                        </label>
                                        <textarea
                                            className={styles.formTextarea}
                                            value={editingRole.description}
                                            onChange={(e) => setEditingRole({
                                                ...editingRole,
                                                description: e.target.value
                                            })}
                                            placeholder="Опишите назначение роли"
                                            rows={3}
                                            disabled={editingRole.isOwner || editingRole.isDefault}
                                        />
                                        {(editingRole.isOwner || editingRole.isDefault) && !isCreating && (
                                            <p className={styles.formHint}>
                                                Описание роли {editingRole.isOwner ? 'владельца' : 'по умолчанию'} нельзя изменить
                                            </p>
                                        )}
                                    </div>

                                    {!editingRole.isOwner && !editingRole.isDefault && (
                                        <div className={styles.permissionsSection}>
                                            <h4 className={styles.permissionsTitle}>
                                                <FaLock className={styles.permissionsTitleIcon} />
                                                Настройка прав доступа
                                                <span className={styles.permissionsCount}>
                                                    {getPermissionCount(editingRole)} из {permissionsList.length} доступов
                                                </span>
                                            </h4>
                                            <p className={styles.permissionsDescription}>
                                                Выберите права, которые будут доступны участникам с этой ролью
                                            </p>

                                            <div className={styles.permissionsGrid}>
                                                {Object.entries(getPermissionGroups()).map(([category, categoryPermissions]) => (
                                                    <div key={category} className={styles.permissionCategory}>
                                                        <div className={styles.categoryHeader}>
                                                            <h5 className={styles.categoryTitle}>
                                                                {category}
                                                                <span className={styles.categoryCount}>
                                                                    {categoryPermissions.filter(p => hasPermission(editingRole, p)).length}/
                                                                    {categoryPermissions.length}
                                                                </span>
                                                            </h5>
                                                            <div className={styles.categoryActions}>
                                                                <button
                                                                    className={styles.categoryAction}
                                                                    onClick={() => toggleAllPermissions(category, true)}
                                                                >
                                                                    Выбрать все
                                                                </button>
                                                                <button
                                                                    className={styles.categoryAction}
                                                                    onClick={() => toggleAllPermissions(category, false)}
                                                                >
                                                                    Очистить все
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className={styles.categoryPermissions}>
                                                            {categoryPermissions.map(permission => (
                                                                <div
                                                                    key={permission.key}
                                                                    className={styles.permissionOption}
                                                                >
                                                                    <div className={styles.permissionInfo}>
                                                                        <div className={styles.permissionIcon}>
                                                                            {permission.icon}
                                                                        </div>
                                                                        <div className={styles.permissionDetails}>
                                                                            <span className={styles.permissionName}>
                                                                                {permission.label}
                                                                            </span>
                                                                            <span className={styles.permissionDesc}>
                                                                                {permission.description}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <label className={styles.permissionToggle}>
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={hasPermission(editingRole, permission)}
                                                                            onChange={() => handlePermissionToggle(permission)}
                                                                            className={styles.toggleInput}
                                                                        />
                                                                        <span className={styles.toggleSlider} />
                                                                    </label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {editingRole.isOwner && (
                                        <div className={styles.ownerPermissionsInfo}>
                                            <div className={styles.ownerInfoCard}>
                                                <FaCrown className={styles.ownerInfoIcon} />
                                                <div className={styles.ownerInfoContent}>
                                                    <h4 className={styles.ownerInfoTitle}>Роль владельца</h4>
                                                    <p className={styles.ownerInfoText}>
                                                        Владелец проекта имеет полный доступ ко всем функциям системы.
                                                        Права доступа для этой роли нельзя изменять.
                                                    </p>
                                                    <div className={styles.ownerPermissions}>
                                                        {permissionsList.map(permission => (
                                                            <span key={permission.key} className={styles.ownerPermission}>
                                                                <FaCheck /> {permission.label}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {editingRole.isDefault && !editingRole.isOwner && (
                                        <div className={styles.ownerPermissionsInfo}>
                                            <div className={styles.ownerInfoCard}>
                                                <FaUserTag className={styles.ownerInfoIcon} />
                                                <div className={styles.ownerInfoContent}>
                                                    <h4 className={styles.ownerInfoTitle}>Роль по умолчанию</h4>
                                                    <p className={styles.ownerInfoText}>
                                                        Эта роль назначается новым участникам проекта по умолчанию.
                                                        Права доступа для этой роли нельзя изменять.
                                                    </p>
                                                    <div className={styles.ownerPermissions}>
                                                        {permissionsList
                                                            .filter(p => ['ISSUE_VIEW', 'COMMENT_CREATE', 'COMMENT_EDIT_OWN', 'COMMENT_DELETE_OWN', 'ATTACHMENT_CREATE', 'ATTACHMENT_EDIT_OWN', 'ATTACHMENT_DELETE_OWN', 'DASHBOARD_VIEW']
                                                                .includes(`${p.entity}_${p.action}`))
                                                            .map(permission => (
                                                                <span key={permission.key} className={styles.ownerPermission}>
                                                                    <FaCheck /> {permission.label}
                                                                </span>
                                                            ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className={styles.modalFooter}>
                                {(editingRole.isOwner || editingRole.isDefault) ? null : (
                                    <>
                                        <button
                                            className={styles.modalCancel}
                                            onClick={() => setEditingRole(null)}
                                        >
                                            Отмена
                                        </button>
                                        <motion.button
                                            className={styles.modalSave}
                                            onClick={handleSaveRole}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <FaSave className={styles.saveIcon} />
                                            {isCreating ? 'Создать роль' : 'Сохранить изменения'}
                                        </motion.button>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {deletingRoleId && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={styles.deleteModal}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className={styles.deleteContent}
                        >
                            <div className={styles.deleteHeader}>
                                <FaUserShield className={styles.deleteIcon} />
                                <h3 className={styles.deleteTitle}>Удаление роли</h3>
                            </div>

                            <div className={styles.deleteBody}>
                                <p className={styles.deleteText}>
                                    Вы уверены, что хотите удалить роль "{roles.find(r => r.id === deletingRoleId)?.name}"?
                                </p>
                                <p className={styles.deleteWarning}>
                                    Это действие нельзя отменить. Все участники с этой ролью будут переназначены на роль по умолчанию.
                                </p>
                            </div>

                            <div className={styles.deleteFooter}>
                                <button
                                    className={styles.deleteCancel}
                                    onClick={() => setDeletingRoleId(null)}
                                >
                                    Отмена
                                </button>
                                <button
                                    className={styles.deleteConfirm}
                                    onClick={confirmDelete}
                                >
                                    <FaTrash className={styles.deleteConfirmIcon} />
                                    Удалить
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RolesSection;