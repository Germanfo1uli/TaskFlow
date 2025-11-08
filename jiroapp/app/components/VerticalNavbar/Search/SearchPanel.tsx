'use client'

import { useState } from 'react'
import { FaSearch, FaTimes, FaHashtag } from 'react-icons/fa'
import styles from './SearchPanel.module.css'

interface SearchPanelProps {
    onClose: () => void
}

const SearchPanel = ({ onClose }: SearchPanelProps) => {
    const [searchQuery, setSearchQuery] = useState('')

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        console.log('Search query:', searchQuery)
    }

    const quickSearches = ['design', 'urgent', 'marketing', 'development']

    return (
        <div className={styles.panelOverlay} onClick={onClose}>
            <div className={styles.searchPanel} onClick={(e) => e.stopPropagation()}>
                <div className={styles.searchHeader}>
                    <div className={styles.searchInputWrapper}>
                        <FaSearch className={styles.searchIcon} />
                        <form onSubmit={handleSearch} className={styles.searchForm}>
                            <input
                                type="text"
                                placeholder="Поиск проектов, тегов..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={styles.searchInput}
                                autoFocus
                            />
                        </form>
                        <button className={styles.closeButton} onClick={onClose}>
                            <FaTimes className={styles.closeIcon} />
                        </button>
                    </div>
                </div>

                {searchQuery === '' && (
                    <div className={styles.quickSearches}>
                        <div className={styles.quickTitle}>Популярные теги</div>
                        <div className={styles.tagsList}>
                            {quickSearches.map((tag, index) => (
                                <button
                                    key={index}
                                    className={styles.tag}
                                    onClick={() => setSearchQuery(tag)}
                                >
                                    <FaHashtag className={styles.tagIcon} />
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {searchQuery && (
                    <div className={styles.searchHint}>
                        Нажмите Enter для поиска "{searchQuery}"
                    </div>
                )}
            </div>
        </div>
    )
}

export default SearchPanel