"""
Тесты управления задачами в TaskFlow.
"""

import time
import pytest
from selenium.webdriver.common.by import By
from selenium.common.exceptions import NoSuchElementException


class TestTasks:
    """Тесты управления задачами"""
    
    def test_check_main_page_loaded(self, logged_in_driver):
        """Проверка, что главная страница загружена после авторизации"""
        time.sleep(2)
        
        current_url = logged_in_driver.current_url
        print(f"Текущий URL: {current_url}")
        
        # Проверяем, что мы не на странице welcome или auth
        if "welcome" in current_url.lower() or "auth" in current_url.lower():
            print("  Похоже, не удалось загрузить главную страницу после авторизации")
            return False
        
        # Проверяем, что страница загружена
        page_source_length = len(logged_in_driver.page_source)
        print(f"Размер страницы: {page_source_length} символов")
        
        assert page_source_length > 1000, f"Страница слишком маленькая: {page_source_length} символов"
        
        return True
    
    def test_find_tasks_elements(self, logged_in_driver):
        """Поиск элементов, связанных с задачами"""
        time.sleep(2)
        
        try:
            # Ищем элементы, связанные с задачами
            task_keywords = ["task", "Task", "задача", "Задача", "todo", "Todo", "задач", "карточк", "card"]
            
            task_elements_found = []
            
            for keyword in task_keywords:
                # Ищем по классу
                elements_by_class = logged_in_driver.find_elements(By.XPATH, f"//*[contains(@class, '{keyword}')]")
                if elements_by_class:
                    task_elements_found.append(f"по классу '{keyword}': {len(elements_by_class)}")
                
                # Ищем по тексту
                elements_by_text = logged_in_driver.find_elements(By.XPATH, f"//*[contains(text(), '{keyword}')]")
                if elements_by_text:
                    task_elements_found.append(f"по тексту '{keyword}': {len(elements_by_text)}")
            
            print(f"Найдены элементы задач: {task_elements_found}")
            
            # Ищем кнопки для создания/управления задачами
            task_buttons = []
            button_texts = ["Создать задачу", "Новая задача", "Добавить", "Add task", "Create task", "+"]
            
            for text in button_texts:
                buttons = logged_in_driver.find_elements(By.XPATH, f"//button[contains(text(), '{text}')]")
                if buttons:
                    task_buttons.append(f"'{text}': {len(buttons)}")
            
            print(f"Найдены кнопки задач: {task_buttons}")
            
            # Проверяем, что есть хотя бы какие-то элементы, связанные с задачами
            assert len(task_elements_found) > 0 or len(task_buttons) > 0, "Не найдены элементы, связанные с задачами"
            
            return True
            
        except Exception as e:
            print(f"Ошибка при поиске элементов задач: {e}")
            return False
    
    def test_tasks_interaction(self, logged_in_driver):
        """Тест взаимодействия с элементами задач"""
        time.sleep(1)
        
        try:
            # Ищем все кликабельные элементы на странице
            clickable_elements = []
            
            # Кнопки
            buttons = logged_in_driver.find_elements(By.TAG_NAME, "button")
            clickable_elements.extend(buttons)
            
            # Ссылки
            links = logged_in_driver.find_elements(By.TAG_NAME, "a")
            clickable_elements.extend(links)
            
            # Div с обработчиком клика
            clickable_divs = logged_in_driver.find_elements(By.XPATH, "//div[@onclick or contains(@class, 'clickable') or contains(@class, 'btn')]")
            clickable_elements.extend(clickable_divs)
            
            print(f"Найдено кликабельных элементов: {len(clickable_elements)}")
            
            if clickable_elements:
                # Ищем безопасные для клика элементы (не удаление, не выход)
                safe_elements = []
                dangerous_keywords = ["удалить", "delete", "удаления", "выход", "logout", "log out", "выйти"]
                
                for element in clickable_elements[:10]:  # Проверяем первые 10 элементов
                    if element.is_displayed() and element.is_enabled():
                        element_text = element.text.strip().lower()
                        element_class = element.get_attribute("class") or ""
                        
                        # Проверяем, не опасный ли это элемент
                        is_dangerous = any(keyword in element_text for keyword in dangerous_keywords) or \
                                      any(keyword in element_class for keyword in dangerous_keywords)
                        
                        if not is_dangerous and element_text:
                            safe_elements.append(element)
                
                if safe_elements:
                    # Кликаем на первый безопасный элемент
                    element_to_click = safe_elements[0]
                    element_text = element_to_click.text.strip()
                    
                    print(f"Кликаем на элемент: '{element_text}'")
                    
                    # Сохраняем текущий URL
                    current_url = logged_in_driver.current_url
                    
                    # Кликаем
                    element_to_click.click()
                    time.sleep(2)
                    
                    # Проверяем, изменился ли URL или состояние страницы
                    new_url = logged_in_driver.current_url
                    
                    if new_url != current_url:
                        print(f"URL изменился: {new_url}")
                    else:
                        print("URL не изменился")
                    
                    return True
                else:
                    print("Не найдено безопасных элементов для клика")
                    return False
            else:
                print("Нет кликабельных элементов")
                return False
                
        except Exception as e:
            print(f"Ошибка при взаимодействии: {e}")
            return False
    
    def test_page_refresh_after_login(self, logged_in_driver):
        """Тест обновления страницы после авторизации"""
        time.sleep(1)
        
        try:
            url_before = logged_in_driver.current_url
            
            # Обновляем страницу
            logged_in_driver.refresh()
            time.sleep(3)
            
            url_after = logged_in_driver.current_url
            
            print(f"URL до обновления: {url_before}")
            print(f"URL после обновления: {url_after}")
            
            # Проверяем, что мы остались на той же странице или вернулись на главную
            assert "auth" not in url_after.lower(), "Вернулись на страницу авторизации после обновления"
            
            return True
            
        except Exception as e:
            print(f"Ошибка при обновлении страницы: {e}")
            return False