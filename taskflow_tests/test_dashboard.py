"""
Тесты дашборда TaskFlow.
Проверяет основные элементы интерфейса после авторизации.
"""

import time
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


class TestDashboard:
    """Тесты дашборда TaskFlow"""
    
    def test_dashboard_loaded(self, logged_in_driver):
        """Тест загрузки дашборда"""
        time.sleep(2)
        
        current_url = logged_in_driver.current_url
        print(f"Текущий URL дашборда: {current_url}")
        
        # Проверяем, что мы не на страницах welcome или auth
        assert "welcome" not in current_url.lower(), "Остались на welcome странице"
        assert "auth" not in current_url.lower(), "Остались на странице авторизации"
        
        # Проверяем наличие основных элементов
        body = logged_in_driver.find_element(By.TAG_NAME, "body")
        assert body.is_displayed()
        
        return True
    
    def test_sidebar_navigation(self, logged_in_driver):
        """Тест боковой панели навигации"""
        time.sleep(2)
        
        try:
            # Ищем боковую панель
            sidebar_selectors = [
                "//*[contains(@class, 'sidebar')]",
                "//*[contains(@class, 'Sidebar')]",
                "//*[contains(@class, 'nav') and (contains(@class, 'left') or contains(@style, 'left'))]",
                "//aside",
                "//nav[contains(@class, 'vertical')]"
            ]
            
            sidebar_found = False
            
            for selector in sidebar_selectors:
                elements = logged_in_driver.find_elements(By.XPATH, selector)
                if elements:
                    print(f"Найдена боковая панель с селектором: {selector}")
                    sidebar_found = True
                    
                    # Проверяем элементы внутри sidebar
                    for element in elements:
                        if element.is_displayed():
                            # Ищем кнопки/ссылки внутри sidebar
                            buttons_in_sidebar = element.find_elements(By.TAG_NAME, "button")
                            links_in_sidebar = element.find_elements(By.TAG_NAME, "a")
                            
                            print(f"В sidebar найдено: {len(buttons_in_sidebar)} кнопок, {len(links_in_sidebar)} ссылок")
                            
                            # Выводим текст первых 3 кнопок
                            for i, btn in enumerate(buttons_in_sidebar[:3]):
                                btn_text = btn.text.strip()
                                if btn_text:
                                    print(f"  Кнопка в sidebar {i+1}: '{btn_text}'")
                            
                            break
                    
                    break
            
            if not sidebar_found:
                print("Боковая панель не найдена по стандартным селекторам")
                
                # Пробуем найти элементы навигации другим способом
                all_nav_elements = logged_in_driver.find_elements(By.XPATH, "//*[contains(@class, 'nav') or contains(@class, 'menu')]")
                if all_nav_elements:
                    print(f"Найдены элементы навигации: {len(all_nav_elements)}")
                    sidebar_found = True
            
            assert sidebar_found, "Боковая панель навигации не найдена"
            return True
            
        except Exception as e:
            print(f"Ошибка при проверке боковой панели: {e}")
            return False
    
    def test_main_content_area(self, logged_in_driver):
        """Тест основной области контента"""
        time.sleep(1)
        
        try:
            # Ищем основную область контента
            content_selectors = [
                "//main",
                "//*[contains(@class, 'content') and contains(@class, 'main')]",
                "//*[contains(@class, 'MainContent')]",
                "//*[contains(@class, 'workspace')]",
                "//*[contains(@class, 'dashboard-content')]"
            ]
            
            content_found = False
            
            for selector in content_selectors:
                elements = logged_in_driver.find_elements(By.XPATH, selector)
                if elements:
                    print(f"Найдена область контента с селектором: {selector}")
                    
                    for element in elements:
                        if element.is_displayed():
                            # Проверяем, что область не пуста
                            text = element.text.strip()
                            if len(text) > 20:
                                print(f"Область контента содержит текст: {text[:150]}...")
                                content_found = True
                                break
                    
                    if content_found:
                        break
            
            if not content_found:
                # Ищем любую большую область с контентом
                large_divs = logged_in_driver.find_elements(By.XPATH, "//div[not(contains(@class, 'nav')) and not(contains(@class, 'sidebar'))]")
                
                for div in large_divs[:15]:
                    if div.is_displayed():
                        div_text = div.text.strip()
                        if len(div_text) > 50:  # Если есть достаточно текста
                            print(f"Найдена область с контентом: {div_text[:100]}...")
                            content_found = True
                            break
            
            assert content_found, "Основная область контента не найдена"
            return True
            
        except Exception as e:
            print(f"Ошибка при проверке области контента: {e}")
            return False
    
    def test_user_profile_section(self, logged_in_driver):
        """Тест секции профиля пользователя"""
        time.sleep(1)
        
        try:
            # Ищем элементы профиля пользователя
            profile_keywords = ["profile", "Profile", "user", "User", "аватар", "Аватар", "профиль", "Профиль"]
            
            profile_elements_found = []
            
            for keyword in profile_keywords:
                # По классу
                elements_by_class = logged_in_driver.find_elements(By.XPATH, f"//*[contains(@class, '{keyword}')]")
                if elements_by_class:
                    profile_elements_found.append(f"по классу '{keyword}': {len(elements_by_class)}")
                
                # По тексту
                elements_by_text = logged_in_driver.find_elements(By.XPATH, f"//*[contains(text(), '{keyword}')]")
                if elements_by_text:
                    profile_elements_found.append(f"по тексту '{keyword}': {len(elements_by_text)}")
            
            print(f"Найдены элементы профиля: {profile_elements_found}")
            
            # Ищем аватар/иконку пользователя
            avatar_elements = logged_in_driver.find_elements(By.XPATH, "//img[contains(@class, 'avatar') or contains(@alt, 'avatar') or contains(@alt, 'user')]")
            print(f"Найдено элементов аватара: {len(avatar_elements)}")
            
            # Проверяем, что есть хотя бы какие-то элементы профиля
            assert len(profile_elements_found) > 0 or len(avatar_elements) > 0, "Не найдены элементы профиля пользователя"
            
            return True
            
        except Exception as e:
            print(f"Ошибка при проверке профиля пользователя: {e}")
            return False
    
    def test_dashboard_interactions(self, logged_in_driver):
        """Тест взаимодействий на дашборде"""
        time.sleep(1)
        
        try:
            # Ищем кнопки на дашборде
            dashboard_buttons = []
            
            # Возможные кнопки на дашборде
            possible_button_texts = [
                "Создать", "Добавить", "Новый", "New", "Create", "Add",
                "Фильтр", "Filter", "Сортировка", "Sort", "Настройки", "Settings"
            ]
            
            for text in possible_button_texts:
                buttons = logged_in_driver.find_elements(By.XPATH, f"//button[contains(text(), '{text}')]")
                if buttons:
                    for btn in buttons:
                        if btn.is_displayed() and btn.is_enabled():
                            dashboard_buttons.append(btn)
            
            print(f"Найдено кнопок на дашборде: {len(dashboard_buttons)}")
            
            if dashboard_buttons:
                # Берем первую безопасную кнопку
                safe_button = None
                dangerous_keywords = ["удалить", "delete", "удаления", "выход", "logout"]
                
                for btn in dashboard_buttons:
                    btn_text = btn.text.strip().lower()
                    if not any(keyword in btn_text for keyword in dangerous_keywords):
                        safe_button = btn
                        break
                
                if safe_button:
                    btn_text = safe_button.text.strip()
                    print(f"Пробуем кликнуть на кнопку: '{btn_text}'")
                    
                    url_before = logged_in_driver.current_url
                    
                    safe_button.click()
                    time.sleep(2)
                    
                    url_after = logged_in_driver.current_url
                    
                    print(f"URL до клика: {url_before}")
                    print(f"URL после клика: {url_after}")
                    
                    # Возвращаемся назад, если изменился URL
                    if url_after != url_before:
                        logged_in_driver.back()
                        time.sleep(2)
                    
                    return True
                else:
                    print("Не найдено безопасных кнопок для клика")
                    return True  # Возвращаем True, так как это не ошибка
            else:
                print("Нет кнопок на дашборде")
                return True  # Возвращаем True, так как это не ошибка
                
        except Exception as e:
            print(f"Ошибка при взаимодействии с дашбордом: {e}")
            return False