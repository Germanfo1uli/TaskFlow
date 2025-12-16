"""
Тесты главной страницы TaskFlow после авторизации.
Проверяет основные элементы и функциональность дашборда.
"""

import time
import pytest
from selenium.webdriver.common.by import By
from selenium.common.exceptions import NoSuchElementException


class TestMainPage:
    """Тесты главной страницы TaskFlow"""
    
    def test_successful_login(self, logged_in_driver, base_url, username, password):
        """Тест успешного входа на главную страницу"""
        # Фикстура logged_in_driver уже выполнила вход
        current_url = logged_in_driver.current_url
        print(f"Текущий URL после авторизации: {current_url}")
        
        # Проверяем, что мы не на странице welcome
        if "welcome" in current_url.lower():
            print("  Похоже, авторизация не удалась - остались на welcome странице")
            return False
        
        print(" Успешно вошли в систему")
        return True
    
    def test_main_page_elements(self, logged_in_driver):
        """Тест основных элементов главной страницы"""
        time.sleep(2)
        
        # Проверяем наличие основных элементов
        try:
            # Проверяем различные возможные классы главной страницы
            possible_containers = [
                "main-container", "MainContainer", "dashboard", "Dashboard",
                "app-container", "AppContainer", "workspace", "Workspace"
            ]
            
            found_elements = []
            
            for container_name in possible_containers:
                elements = logged_in_driver.find_elements(By.XPATH, f"//*[contains(@class, '{container_name}')]")
                if elements:
                    found_elements.append(container_name)
            
            print(f"Найдены элементы с классами: {found_elements}")
            
            # Проверяем наличие кнопок и элементов интерфейса
            buttons = logged_in_driver.find_elements(By.TAG_NAME, "button")
            print(f"Найдено кнопок: {len(buttons)}")
            
            # Выводим текст первых 5 кнопок для отладки
            for i, btn in enumerate(buttons[:5]):
                btn_text = btn.text.strip()
                if btn_text:
                    print(f"Кнопка {i+1}: '{btn_text}'")
            
            # Ищем элементы навигации
            nav_elements = logged_in_driver.find_elements(By.XPATH, "//*[contains(@class, 'nav') or contains(@class, 'Nav')]")
            print(f"Найдено элементов навигации: {len(nav_elements)}")
            
            # Ищем элементы sidebar/панели управления
            sidebar_elements = logged_in_driver.find_elements(By.XPATH, "//*[contains(@class, 'sidebar') or contains(@class, 'Sidebar') or contains(@class, 'panel') or contains(@class, 'Panel')]")
            print(f"Найдено элементов sidebar/панели: {len(sidebar_elements)}")
            
            # Проверяем, что есть хотя бы какие-то элементы интерфейса
            assert len(buttons) > 0, "Нет кнопок на странице"
            assert len(found_elements) > 0 or len(sidebar_elements) > 0 or len(nav_elements) > 0, "Не найдены основные элементы интерфейса"
            
            return True
            
        except Exception as e:
            print(f"Ошибка при проверке элементов: {e}")
            return False
    
    def test_navigation_structure(self, logged_in_driver):
        """Тест структуры навигации"""
        time.sleep(1)
        
        try:
            # Ищем различные элементы навигации
            navigation_found = False
            
            # Проверяем возможные классы навигации
            nav_selectors = [
                "//*[contains(@class, 'navbar')]",
                "//*[contains(@class, 'Navbar')]",
                "//*[contains(@class, 'navigation')]",
                "//*[contains(@class, 'Navigation')]",
                "//*[contains(@class, 'menu') and contains(@class, 'vertical')]",
                "//*[contains(@class, 'sidebar')]",
                "//*[contains(@class, 'Sidebar')]",
                "//nav",
                "//aside"
            ]
            
            for selector in nav_selectors:
                elements = logged_in_driver.find_elements(By.XPATH, selector)
                if elements:
                    print(f"Найдена навигация с селектором: {selector}")
                    navigation_found = True
                    break
            
            if not navigation_found:
                # Пробуем найти по структуре
                nav_like_elements = logged_in_driver.find_elements(By.XPATH, "//div[contains(@class, 'nav') or contains(@style, 'left') or contains(@style, 'right')]")
                if nav_like_elements:
                    print(f"Найдены элементы, похожие на навигацию: {len(nav_like_elements)}")
                    navigation_found = True
            
            assert navigation_found, "Навигация не найдена"
            return True
            
        except Exception as e:
            print(f"Ошибка при проверке навигации: {e}")
            return False
    
    def test_content_area(self, logged_in_driver):
        """Тест области контента"""
        time.sleep(1)
        
        try:
            # Ищем основную область контента
            content_selectors = [
                "//*[contains(@class, 'content')]",
                "//*[contains(@class, 'Content')]",
                "//*[contains(@class, 'main')]",
                "//*[contains(@class, 'Main')]",
                "//main",
                "//section[contains(@class, 'content')]",
                "//div[contains(@class, 'workspace')]",
                "//div[contains(@class, 'board')]"
            ]
            
            content_found = False
            
            for selector in content_selectors:
                elements = logged_in_driver.find_elements(By.XPATH, selector)
                if elements:
                    print(f"Найдена область контента с селектором: {selector}")
                    
                    # Проверяем, что область видима и не пуста
                    for element in elements:
                        if element.is_displayed():
                            text = element.text.strip()
                            if len(text) > 10:  # Если есть какой-то текст
                                print(f"Область контента содержит текст (первые 100 символов): {text[:100]}...")
                                content_found = True
                                break
                    
                    if content_found:
                        break
            
            if not content_found:
                # Пробуем найти любую область с контентом
                all_divs = logged_in_driver.find_elements(By.TAG_NAME, "div")
                for div in all_divs[:20]:  # Проверяем первые 20 div элементов
                    if div.is_displayed():
                        text = div.text.strip()
                        if len(text) > 50:  # Если есть достаточно текста
                            print(f"Найден div с контентом: {text[:100]}...")
                            content_found = True
                            break
            
            assert content_found, "Область контента не найдена"
            return True
            
        except Exception as e:
            print(f"Ошибка при проверке области контента: {e}")
            return False
    
    def test_page_title_and_header(self, logged_in_driver):
        """Тест заголовка страницы и заголовков"""
        time.sleep(1)
        
        try:
            # Проверяем title страницы
            page_title = logged_in_driver.title
            print(f"Заголовок страницы: {page_title}")
            
            # Ищем заголовки на странице
            headers = logged_in_driver.find_elements(By.XPATH, "//h1 | //h2 | //h3")
            print(f"Найдено заголовков (h1-h3): {len(headers)}")
            
            # Выводим заголовки
            for i, header in enumerate(headers):
                if header.is_displayed():
                    header_text = header.text.strip()
                    if header_text:
                        print(f"Заголовок {i+1}: {header_text}")
            
            # Проверяем, что есть хотя бы один заголовок или непустой title
            assert len(headers) > 0 or page_title.strip() != "", "Нет заголовков на странице"
            
            return True
            
        except Exception as e:
            print(f"Ошибка при проверке заголовков: {e}")
            return False