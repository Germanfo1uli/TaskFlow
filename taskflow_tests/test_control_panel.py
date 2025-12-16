"""
Тесты панели управления TaskFlow.
Проверяет базовую функциональность после входа.
"""

import time
import pytest
from selenium.webdriver.common.by import By
from selenium.common.exceptions import NoSuchElementException


class TestControlPanel:
    """Тесты панели управления TaskFlow"""
    
    def test_access_auth_page(self, driver, base_url):
        """Тест доступа к странице авторизации"""
        driver.get(base_url)
        time.sleep(2)
        
        print(f"Текущий URL: {driver.current_url}")
        
        # Сохраняем cookies для отладки
        cookies = driver.get_cookies()
        print(f"Количество cookies: {len(cookies)}")
        
        # Проверяем, что мы на welcome странице
        if "welcome" in driver.current_url.lower():
            print("На welcome странице")
            
            # Ищем кнопку для перехода на страницу входа
            possible_button_texts = [
                "Начать работу", 
                "Начать", 
                "Войти", 
                "Вход", 
                "Sign In", 
                "Login",
                "Get Started",
                "Start"
            ]
            
            found_button = None
            for text in possible_button_texts:
                try:
                    elements = driver.find_elements(By.XPATH, f"//button[contains(translate(text(), 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ', 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя'), '{text.lower()}')]")
                    if not elements:
                        # Пробуем с англоязычным текстом
                        elements = driver.find_elements(By.XPATH, f"//button[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '{text.lower()}')]")
                    
                    if elements:
                        found_button = elements[0]
                        print(f"Найдена кнопка с текстом похожим на '{text}': '{found_button.text}'")
                        break
                except:
                    continue
            
            if found_button:
                print(f"Кликаем на кнопку: {found_button.text}")
                try:
                    found_button.click()
                    time.sleep(3)
                    print(f"Текущий URL после клика: {driver.current_url}")
                    
                    # Проверяем, перешли ли мы на страницу авторизации
                    if "auth" in driver.current_url.lower() or "login" in driver.current_url.lower():
                        print("Успешно перешли на страницу авторизации")
                        return True
                    else:
                        print("Не перешли на страницу авторизации")
                        return False
                        
                except Exception as e:
                    print(f"Ошибка при клике на кнопку: {e}")
                    return False
            else:
                print("Кнопка для перехода на страницу входа не найдена")
                return False
        else:
            print(f"Не на welcome странице, текущий URL: {driver.current_url}")
            return False
    
    def test_auth_page_elements(self, driver, base_url):
        """Тест элементов страницы авторизации"""
        # Сначала переходим на страницу авторизации
        auth_result = self.test_access_auth_page(driver, base_url)
        
        if not auth_result:
            # Если не удалось перейти через кнопку, пробуем прямой URL
            auth_url = base_url.replace("/welcome", "/auth")
            print(f"Пробуем прямой доступ: {auth_url}")
            driver.get(auth_url)
            time.sleep(3)
        
        print(f"Текущий URL: {driver.current_url}")
        
        # Ищем поля ввода на странице авторизации
        input_fields = driver.find_elements(By.TAG_NAME, "input")
        print(f"Найдено полей ввода: {len(input_fields)}")
        
        for i, field in enumerate(input_fields):
            field_type = field.get_attribute("type")
            field_name = field.get_attribute("name")
            field_placeholder = field.get_attribute("placeholder")
            print(f"Поле {i+1}: type='{field_type}', name='{field_name}', placeholder='{field_placeholder}'")
        
        # Ищем кнопки отправки формы
        buttons = driver.find_elements(By.TAG_NAME, "button")
        submit_buttons = []
        
        for btn in buttons:
            btn_type = btn.get_attribute("type")
            btn_text = btn.text
            if btn_type == "submit" or "войти" in btn_text.lower() or "login" in btn_text.lower() or "sign in" in btn_text.lower():
                submit_buttons.append(btn)
                print(f"Кнопка отправки: text='{btn_text}', type='{btn_type}'")
        
        return len(input_fields) >= 2 and len(submit_buttons) > 0
    
    def test_attempt_login(self, driver, base_url):
        """Тест попытки входа в систему"""
        # Сначала убеждаемся, что мы на странице авторизации
        if not self.test_auth_page_elements(driver, base_url):
            print("Не удалось найти элементы страницы авторизации")
            return False
        
        # Ищем поля для ввода
        input_fields = driver.find_elements(By.TAG_NAME, "input")
        
        # Ищем поле email
        email_field = None
        for field in input_fields:
            field_type = field.get_attribute("type")
            field_name = field.get_attribute("name") or ""
            field_placeholder = field.get_attribute("placeholder") or ""
            
            if field_type == "email" or "email" in field_name.lower() or "email" in field_placeholder.lower():
                email_field = field
                break
        
        if not email_field and len(input_fields) > 0:
            email_field = input_fields[0]  # Берем первое поле как email
        
        # Ищем поле пароля
        password_field = None
        for field in input_fields:
            field_type = field.get_attribute("type")
            field_name = field.get_attribute("name") or ""
            field_placeholder = field.get_attribute("placeholder") or ""
            
            if field_type == "password" or "password" in field_name.lower() or "парол" in field_placeholder.lower():
                password_field = field
                break
        
        if not password_field and len(input_fields) > 1:
            password_field = input_fields[1]  # Берем второе поле как пароль
        
        # Ищем кнопку входа
        submit_button = None
        buttons = driver.find_elements(By.TAG_NAME, "button")
        
        for btn in buttons:
            btn_type = btn.get_attribute("type")
            btn_text = btn.text.lower()
            if btn_type == "submit" or "войти" in btn_text or "login" in btn_text or "sign in" in btn_text:
                submit_button = btn
                break
        
        if not submit_button and buttons:
            submit_button = buttons[-1]  # Берем последнюю кнопку
        
        # Если нашли все элементы, пробуем войти
        if email_field and password_field and submit_button:
            print("Поля входа найдены, пытаемся войти...")
            
            try:
                # Вводим email
                email_field.clear()
                email_field.send_keys("test@mail.ru")
                print("Введен email: test@mail.ru")
                
                # Вводим пароль
                password_field.clear()
                password_field.send_keys("Password1234")
                print("Введен пароль")
                
                # Кликаем на кнопку
                submit_button.click()
                print("Кликнули на кнопку входа")
                
                time.sleep(5)
                
                print(f"Текущий URL после входа: {driver.current_url}")
                
                # Проверяем, успешен ли вход
                current_url = driver.current_url
                if "welcome" in current_url.lower():
                    print("Похоже, остались на welcome странице (неуспешный вход)")
                    return False
                else:
                    print("Возможно, успешный вход, перешли на другую страницу")
                    return True
                    
            except Exception as e:
                print(f"Ошибка при попытке входа: {e}")
                return False
        else:
            print("Не удалось найти все необходимые поля для входа")
            print(f"Email field: {email_field}, Password field: {password_field}, Submit button: {submit_button}")
            return False