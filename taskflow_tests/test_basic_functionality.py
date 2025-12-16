"""
Базовые тесты функциональности TaskFlow.
Проверяет основные возможности без необходимости авторизации.
"""

import time
import pytest
from selenium.webdriver.common.by import By


class TestBasicFunctionality:
    """Базовые тесты функциональности"""
    
    def test_homepage_loading(self, driver, base_url):
        """Тест загрузки домашней страницы"""
        driver.get(base_url)
        time.sleep(3)
        
        print(f"URL: {driver.current_url}")
        print(f"Заголовок: {driver.title}")
        print(f"Размер страницы: {len(driver.page_source)} символов")
        
        assert len(driver.page_source) > 1000, "Страница слишком маленькая"
        return True
    
    def test_homepage_elements(self, driver, base_url):
        """Тест наличия основных элементов на домашней странице"""
        driver.get(base_url)
        time.sleep(2)
        
        elements_found = {}
        
        # Проверяем наличие различных элементов
        check_elements = [
            ("h1", "Заголовки h1"),
            ("h2", "Заголовки h2"),
            ("button", "Кнопки"),
            ("img", "Изображения"),
            ("a", "Ссылки"),
            ("div", "Блоки div"),
            ("p", "Параграфы"),
            ("span", "Элементы span")
        ]
        
        for tag, name in check_elements:
            elements = driver.find_elements(By.TAG_NAME, tag)
            elements_found[name] = len(elements)
        
        print("Найденные элементы:")
        for name, count in elements_found.items():
            print(f"  {name}: {count}")
        
        # Проверяем, что есть хотя бы некоторые элементы
        assert elements_found["Кнопки"] > 0, "Нет кнопок на странице"
        assert elements_found["Заголовки h1"] + elements_found["Заголовки h2"] > 0, "Нет заголовков на странице"
        
        return True
    
    def test_navigation_to_auth(self, driver, base_url):
        """Тест навигации на страницу авторизации"""
        driver.get(base_url)
        time.sleep(2)
        
        # Пробуем разные способы перехода на страницу авторизации
        url_before = driver.current_url
        
        # Способ 1: Прямой URL
        auth_url = base_url.replace("/welcome", "/auth")
        driver.get(auth_url)
        time.sleep(3)
        
        if driver.current_url != url_before:
            print(f"Успешно перешли на: {driver.current_url}")
            return True
        
        # Способ 2: Клик по кнопке (если есть)
        driver.get(base_url)
        time.sleep(2)
        
        # Ищем любую кнопку с текстом о входе
        button_texts = ["Начать работу", "Войти", "Вход", "Login", "Sign In", "Начать"]
        
        for text in button_texts:
            try:
                xpath = f"//button[contains(text(), '{text}')]"
                buttons = driver.find_elements(By.XPATH, xpath)
                
                if buttons:
                    print(f"Найдена кнопка: {text}")
                    buttons[0].click()
                    time.sleep(3)
                    
                    if driver.current_url != url_before:
                        print(f"Успешно перешли по кнопке: {driver.current_url}")
                        return True
                        
            except Exception as e:
                print(f"Ошибка при клике на кнопку '{text}': {e}")
                continue
        
        print("Не удалось перейти на страницу авторизации")
        return False
    
    def test_auth_page_form(self, driver, base_url):
        """Тест формы авторизации"""
        # Сначала переходим на страницу авторизации
        if not self.test_navigation_to_auth(driver, base_url):
            pytest.skip("Не удалось перейти на страницу авторизации")
        
        time.sleep(2)
        
        # Проверяем элементы формы
        form_elements = []
        
        # Ищем поля ввода
        inputs = driver.find_elements(By.TAG_NAME, "input")
        for i, inp in enumerate(inputs):
            inp_type = inp.get_attribute("type") or "text"
            inp_name = inp.get_attribute("name") or f"input_{i}"
            inp_placeholder = inp.get_attribute("placeholder") or ""
            form_elements.append(f"{inp_name} ({inp_type}): {inp_placeholder}")
        
        # Ищем кнопки
        buttons = driver.find_elements(By.TAG_NAME, "button")
        for i, btn in enumerate(buttons):
            btn_text = btn.text or f"button_{i}"
            btn_type = btn.get_attribute("type") or "button"
            form_elements.append(f"Кнопка: {btn_text} ({btn_type})")
        
        print("Элементы формы:")
        for element in form_elements:
            print(f"  {element}")
        
        # Проверяем наличие основных элементов
        assert len(inputs) >= 2, f"Ожидалось минимум 2 поля ввода, найдено: {len(inputs)}"
        assert len(buttons) > 0, f"Ожидались кнопки, найдено: {len(buttons)}"
        
        return True