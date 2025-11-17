import { FaUserCircle, FaPen } from 'react-icons/fa'
import styles from './ProfileSettings.module.css'
import { useState } from 'react'

//Заглушка данных
const dummyUserData = {
    fullName: 'Имя Фамилия',
    username: 'username',
}

const ProfileSettings = () => {
    const [fullName, setFullName] = useState(dummyUserData.fullName)
    const [username, setUsername] = useState(dummyUserData.username)
    const [description, setDescription] = useState('Введите описание...')
    
    const [isEditingName, setIsEditingName] = useState(false)
    const [isEditingUser, setIsEditingUser] = useState(false)
    const [isEditingDescription, setIsEditingDescription] = useState(false)
    
    const [editValue, setEditValue] = useState(fullName)

    //Имя пользователя
    const handleEditNameClick = () => {
        setIsEditingName(true)
        setEditValue(fullName) 
    }

    const handleBlurName = () => {
        if (editValue.trim()) {
            setFullName(editValue)
        }
        setIsEditingName(false)
    }

    const handleKeyDownName = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleBlurName()
        }
    }

    //Юзернейм
    const handleEditUserClick = () => {
        setIsEditingUser(true)
        setEditValue(username)
    }

    const handleBlurUser = () => {
        if (editValue.trim()) {
            setUsername(editValue)
        }
        setIsEditingName(false)
    }

    const handleKeyDownUser = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleBlurUser()
        }
    }

    //Описание
    const handleEditDescClick = () => {
        setIsEditingDescription(true)
        setEditValue(description)
    }

    const handleBlurDesc = () => {
        if (editValue.trim()) {
            setDescription(editValue)
        }
        setIsEditingDescription(false)
    }

    const handleKeyDownDesc = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleBlurDesc()
        }
    }

    return (
        <div className={styles.userData}>
            <div className={styles.userPhoto}>
                <FaUserCircle className={styles.userIcon} />
                <p className={styles.username}>{dummyUserData.username}</p>
                <button className={styles.photoButton}>
                    <FaPen />
                    <p>Изменить фото</p>
                </button>
            </div>

            <div className={styles.usernameSettings}>
                <p>Имя пользователя</p>

                {isEditingName ? (
                    <div className={styles.editInputWrapper}>
                        <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={handleKeyDownName}
                            onBlur={handleBlurName}
                            autoFocus
                            className={styles.editInput}
                        />
                        <FaPen className={styles.editIcon} />
                    </div>
                ) : (
                    <div className={styles.viewMode}>
                        <span className={styles.fullName}>{fullName}</span>
                        <button
                            className={styles.editButton}
                            onClick={handleEditNameClick}
                            aria-label="Редактировать имя"
                        >
                            <FaPen />
                        </button>
                    </div>
                )}

                <p>Никнейм</p>

                {isEditingUser ? (
                    <div className={styles.editInputWrapper}>
                        <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={handleKeyDownUser}
                            onBlur={handleBlurUser}
                            autoFocus
                            className={styles.editInput}
                        />
                        <FaPen className={styles.editIcon} />
                    </div>
                ) : (
                    <div className={styles.viewMode}>
                        <span className={styles.fullName}>{username}</span>
                        <button
                            className={styles.editButton}
                            onClick={handleEditUserClick}
                            aria-label="Редактировать юзернейм"
                        >
                            <FaPen />
                        </button>
                    </div>
                )}

                <p>Описание</p>

                {isEditingDescription ? (
                    <div className={styles.editInputWrapper}>
                        <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={handleKeyDownDesc}
                            onBlur={handleBlurDesc}
                            autoFocus
                            className={styles.editInput}
                        />
                        <FaPen className={styles.editIcon} />
                    </div>
                ) : (
                    <div className={styles.viewMode}>
                        <span className={styles.fullName}>{description}</span>
                        <button
                            className={styles.editButton}
                            onClick={handleEditDescClick}
                            aria-label="Редактировать описание"
                        >
                            <FaPen />
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ProfileSettings