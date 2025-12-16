from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import time

class TestTaskFlowAuth:
    """Тесты авторизации для TaskFlow"""
    
    # Локаторы на основе вашего HTML
    START_WORK_BUTTON = (By.XPATH, "//button[contains(@class, 'WelcomePage-module__ctaButton')]//span[contains(text(), 'Начать работу')]")
    START_FREE_BUTTON = (By.XPATH, "//button[contains(@class, 'AboutSection-module__ctaButton') and contains(text(), 'Начать бесплатно')]")
    AUTH_MODAL_TITLE = (By.XPATH, "//*[contains(text(), 'Вход') or contains(text(), 'Авторизация') or contains(text(), 'Войти')]")
    EMAIL_FIELD = (By.XPATH, "//input[@type='email' or contains(@placeholder, 'Email') or contains(@placeholder, 'email')]")
    PASSWORD_FIELD = (By.XPATH, "//input[@type='password' or contains(@placeholder, 'Пароль')]")
    LOGIN_BUTTON = (By.XPATH, "//button[@type='submit' and (contains(text(), 'Войти') or contains(text(), 'Вход') or contains(text(), 'Login'))]")
    FORGOT_PASSWORD = (By.XPATH, "//a[contains(text(), 'Забыли') or contains(text(), 'Forgot')]")
    REGISTER_LINK = (By.XPATH, "//a[contains(text(), 'Регистрация') or contains(text(), 'Зарегистрироваться')]")
    ERROR_MESSAGE = (By.XPATH, "//div[contains(@class, 'error') or contains(@class, 'Error') or contains(@role, 'alert')]")
    PASSWORD_TOGGLE = (By.XPATH, "//button[@aria-label='Показать пароль' or contains(@title, 'пароль')]")
    CLOSE_BUTTON = (By.XPATH, "//button[@aria-label='Закрыть' or contains(text(), '×') or contains(text(), 'Закрыть')]")
    
    # Тестовые данные
    TEST_EMAIL = "testuser@example.com"
    TEST_PASSWORD = "TestPassword123!"
    INVALID_EMAIL = "invalid@email.com"
    INVALID_PASSWORD = "wrongpass"
    
    def test_navigation_to_auth_from_hero_button(self, driver, base_url):
        """Тест 1: Переход к авторизации через кнопку 'Начать работу' в hero-секции"""
        print("\n" + "="*60)
        print("ТЕСТ 1: Переход к авторизации через кнопку 'Начать работу'")
        print("="*60)
        
        driver.get(base_url)
        time.sleep(3)
        
        # Прокручиваем немного для уверенности
        driver.execute_script("window.scrollTo(0, 100)")
        time.sleep(1)
        
        # Ищем кнопку "Начать работу" в hero-секции
        try:
            # Пробуем найти по точному локатору
            start_button = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable(self.START_WORK_BUTTON)
            )
            print(f"✓ Найдена кнопка 'Начать работу': {start_button.text}")
            
            # Прокручиваем к кнопке
            driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", start_button)
            time.sleep(1)
            
            # Кликаем
            start_button.click()
            print("✓ Кнопка нажата")
            
        except TimeoutException:
            print("✗ Кнопка 'Начать работу' не найдена, ищем альтернативы...")
            
            # Ищем другие кнопки с текстом "Начать"
            start_buttons = driver.find_elements(By.XPATH, "//button[contains(text(), 'Начать')]")
            for btn in start_buttons:
                print(f"  Найдена кнопка: {btn.text}")
                if "Начать" in btn.text:
                    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", btn)
                    time.sleep(1)
                    btn.click()
                    print(f"✓ Нажата альтернативная кнопка: {btn.text}")
                    break
        
        # Ждем появления модалки авторизации
        time.sleep(3)
        
        # Проверяем, появилась ли форма авторизации
        try:
            auth_title = WebDriverWait(driver, 5).until(
                EC.presence_of_element_located(self.AUTH_MODAL_TITLE)
            )
            print(f"✓ Форма авторизации открыта: {auth_title.text}")
            return True
        except TimeoutException:
            print("✗ Форма авторизации не появилась")
            print(f"  Текущий URL: {driver.current_url}")
            
            # Проверяем, может быть мы перешли на другую страницу
            if "auth" in driver.current_url or "login" in driver.current_url:
                print("✓ Похоже мы на странице авторизации")
                return True
            
            return False
    
    def test_navigation_to_auth_from_cta_section(self, driver, base_url):
        """Тест 2: Переход к авторизации через кнопку 'Начать бесплатно' в нижней секции"""
        print("\n" + "="*60)
        print("ТЕСТ 2: Переход к авторизации через кнопку 'Начать бесплатно'")
        print("="*60)
        
        driver.get(base_url)
        time.sleep(2)
        
        # Прокручиваем вниз к секции с кнопкой
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight - 500)")
        time.sleep(2)
        
        try:
            # Ищем кнопку "Начать бесплатно"
            start_free_button = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located(self.START_FREE_BUTTON)
            )
            
            driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", start_free_button)
            time.sleep(1)
            
            print(f"✓ Найдена кнопка 'Начать бесплатно': {start_free_button.text}")
            
            # Кликаем
            start_free_button.click()
            print("✓ Кнопка нажата")
            time.sleep(3)
            
            # Проверяем, появилась ли форма авторизации
            auth_elements = driver.find_elements(*self.AUTH_MODAL_TITLE)
            if auth_elements:
                print(f"✓ Форма авторизации открыта: {auth_elements[0].text}")
                return True
            else:
                print("✗ Форма авторизации не появилась")
                return False
                
        except TimeoutException:
            print("✗ Кнопка 'Начать бесплатно' не найдена")
            return False
    
    def test_auth_form_elements(self, driver, base_url):
        """Тест 3: Проверка всех элементов формы авторизации"""
        print("\n" + "="*60)
        print("ТЕСТ 3: Проверка элементов формы авторизации")
        print("="*60)
        
        # Открываем форму авторизации через тест 1
        if not self.test_navigation_to_auth_from_hero_button(driver, base_url):
            print("✗ Не удалось открыть форму авторизации, пропускаем тест")
            return False
        
        time.sleep(2)
        
        # Поиск всех элементов формы
        elements_found = []
        
        # 1. Поле email
        email_fields = driver.find_elements(*self.EMAIL_FIELD)
        if email_fields:
            print(f"✓ Поле email найдено (тип: {email_fields[0].get_attribute('type')})")
            elements_found.append("email")
        else:
            print("✗ Поле email не найдено")
            # Поиск по всем input
            all_inputs = driver.find_elements(By.TAG_NAME, "input")
            print(f"  Всего input элементов: {len(all_inputs)}")
            for i, inp in enumerate(all_inputs):
                print(f"  Input {i}: type={inp.get_attribute('type')}, placeholder={inp.get_attribute('placeholder')}")
        
        # 2. Поле пароля
        password_fields = driver.find_elements(*self.PASSWORD_FIELD)
        if password_fields:
            print(f"✓ Поле пароля найдено (тип: {password_fields[0].get_attribute('type')})")
            elements_found.append("password")
        else:
            print("✗ Поле пароля не найдено")
        
        # 3. Кнопка входа
        login_buttons = driver.find_elements(*self.LOGIN_BUTTON)
        if login_buttons:
            print(f"✓ Кнопка входа найдена: {login_buttons[0].text}")
            elements_found.append("login_button")
        else:
            print("✗ Кнопка входа не найдена")
            # Поиск всех кнопок
            all_buttons = driver.find_elements(By.TAG_NAME, "button")
            print(f"  Всего кнопок: {len(all_buttons)}")
            for i, btn in enumerate(all_buttons[:5]):  # Показываем первые 5
                if btn.text:
                    print(f"  Кнопка {i}: '{btn.text}'")
        
        # 4. Ссылка "Забыли пароль?"
        forgot_links = driver.find_elements(*self.FORGOT_PASSWORD)
        if forgot_links:
            print(f"✓ Ссылка 'Забыли пароль?' найдена: {forgot_links[0].text}")
            elements_found.append("forgot_password")
        else:
            print("ℹ Ссылка 'Забыли пароль?' не найдена (может отсутствовать)")
        
        # 5. Ссылка на регистрацию
        register_links = driver.find_elements(*self.REGISTER_LINK)
        if register_links:
            print(f"✓ Ссылка на регистрацию найдена: {register_links[0].text}")
            elements_found.append("register_link")
        else:
            print("ℹ Ссылка на регистрацию не найдена (может отсутствовать)")
        
        # 6. Заголовок формы
        auth_titles = driver.find_elements(*self.AUTH_MODAL_TITLE)
        if auth_titles:
            print(f"✓ Заголовок формы найден: {auth_titles[0].text}")
            elements_found.append("title")
        
        print(f"\nИтого найдено элементов: {len(elements_found)} из 6 основных")
        return len(elements_found) >= 3  # Минимум 3 основных элемента
    
    def test_password_visibility_toggle(self, driver, base_url):
        """Тест 4: Проверка переключения видимости пароля"""
        print("\n" + "="*60)
        print("ТЕСТ 4: Проверка переключения видимости пароля")
        print("="*60)
        
        if not self.test_navigation_to_auth_from_hero_button(driver, base_url):
            return False
        
        time.sleep(2)
        
        # Находим поле пароля
        password_fields = driver.find_elements(*self.PASSWORD_FIELD)
        if not password_fields:
            print("✗ Поле пароля не найдено, пропускаем тест")
            return False
        
        password_field = password_fields[0]
        print(f"✓ Найдено поле пароля (тип: {password_field.get_attribute('type')})")
        
        # Вводим тестовый пароль
        password_field.clear()
        password_field.send_keys(self.TEST_PASSWORD)
        print(f"✓ Введен тестовый пароль: {'*' * len(self.TEST_PASSWORD)}")
        
        # Ищем кнопку переключения видимости
        toggle_buttons = driver.find_elements(*self.PASSWORD_TOGGLE)
        
        if toggle_buttons:
            toggle_button = toggle_buttons[0]
            
            # Проверяем начальное состояние
            initial_type = password_field.get_attribute("type")
            print(f"✓ Начальный тип поля: '{initial_type}'")
            
            # Кликаем для показа пароля
            toggle_button.click()
            time.sleep(1)
            
            # Проверяем изменение типа
            type_after_show = password_field.get_attribute("type")
            print(f"✓ Тип после клика 'Показать': '{type_after_show}'")
            
            # Проверяем, виден ли пароль
            if type_after_show == "text" or password_field.get_attribute("value") == self.TEST_PASSWORD:
                print("✓ Пароль стал видимым")
            else:
                print("✗ Пароль не стал видимым")
            
            # Кликаем для скрытия пароля
            toggle_button.click()
            time.sleep(1)
            
            type_after_hide = password_field.get_attribute("type")
            print(f"✓ Тип после клика 'Скрыть': '{type_after_hide}'")
            
            if type_after_hide == "password":
                print("✓ Пароль снова скрыт")
                return True
            else:
                print("✗ Пароль не скрылся")
                return False
                
        else:
            print("ℹ Кнопка переключения видимости пароля не найдена (это нормально)")
            # Проверяем, есть ли иконка глаза в поле пароля
            password_parent = password_field.find_element(By.XPATH, "..")
            eye_icons = password_parent.find_elements(By.XPATH, ".//*[contains(@class, 'eye') or contains(@aria-label, 'eye')]")
            if eye_icons:
                print(f"  Найдена иконка глаза в поле пароля")
            return True  # Не критичная ошибка
    
    def test_empty_form_validation(self, driver, base_url):
        """Тест 5: Валидация пустой формы"""
        print("\n" + "="*60)
        print("ТЕСТ 5: Валидация пустой формы")
        print("="*60)
        
        if not self.test_navigation_to_auth_from_hero_button(driver, base_url):
            return False
        
        time.sleep(2)
        
        # Находим кнопку входа
        login_buttons = driver.find_elements(*self.LOGIN_BUTTON)
        if not login_buttons:
            print("✗ Кнопка входа не найдена")
            return False
        
        login_button = login_buttons[0]
        
        # Кликаем на пустую форму
        print("✓ Нажимаем кнопку входа с пустой формой")
        login_button.click()
        time.sleep(2)
        
        # Проверяем наличие сообщений об ошибке
        error_elements = driver.find_elements(*self.ERROR_MESSAGE)
        if error_elements:
            print(f"✓ Отображены сообщения об ошибке: {len(error_elements)} шт.")
            for i, error in enumerate(error_elements[:3]):  # Показываем первые 3
                if error.text:
                    print(f"  Ошибка {i+1}: {error.text}")
            return True
        else:
            print("ℹ Сообщения об ошибке не отображены (может быть HTML5 валидация)")
            
            # Проверяем HTML5 валидацию
            email_fields = driver.find_elements(*self.EMAIL_FIELD)
            if email_fields:
                is_required = email_fields[0].get_attribute("required")
                if is_required:
                    print("✓ Поле email имеет атрибут required")
                    return True
            
            return False
    
    def test_invalid_email_format(self, driver, base_url):
        """Тест 6: Валидация неверного формата email"""
        print("\n" + "="*60)
        print("ТЕСТ 6: Валидация неверного формата email")
        print("="*60)
        
        if not self.test_navigation_to_auth_from_hero_button(driver, base_url):
            return False
        
        time.sleep(2)
        
        # Находим поле email
        email_fields = driver.find_elements(*self.EMAIL_FIELD)
        if not email_fields:
            print("✗ Поле email не найдено")
            return False
        
        email_field = email_fields[0]
        
        # Вводим неверный email
        invalid_email = "not-an-email"
        email_field.clear()
        email_field.send_keys(invalid_email)
        print(f"✓ Введен неверный email: {invalid_email}")
        
        # Находим кнопку входа и кликаем
        login_buttons = driver.find_elements(*self.LOGIN_BUTTON)
        if login_buttons:
            login_buttons[0].click()
            time.sleep(2)
            
            # Проверяем ошибки
            error_elements = driver.find_elements(*self.ERROR_MESSAGE)
            if error_elements:
                print(f"✓ Отображена ошибка валидации email")
                for error in error_elements:
                    if "email" in error.text.lower() or "формат" in error.text.lower():
                        print(f"  Сообщение: {error.text}")
                        return True
            else:
                print("ℹ Ошибка валидации email не отображена")
        
        return False
    
    def test_successful_login_attempt(self, driver, base_url):
        """Тест 7: Попытка успешного входа"""
        print("\n" + "="*60)
        print("ТЕСТ 7: Попытка успешного входа")
        print("="*60)
        
        if not self.test_navigation_to_auth_from_hero_button(driver, base_url):
            return False
        
        time.sleep(2)
        
        # Находим поля формы
        email_fields = driver.find_elements(*self.EMAIL_FIELD)
        password_fields = driver.find_elements(*self.PASSWORD_FIELD)
        login_buttons = driver.find_elements(*self.LOGIN_BUTTON)
        
        if not all([email_fields, password_fields, login_buttons]):
            print("✗ Не все элементы формы найдены")
            return False
        
        email_field, password_field, login_button = email_fields[0], password_fields[0], login_buttons[0]
        
        # Заполняем форму валидными данными
        email_field.clear()
        email_field.send_keys(self.TEST_EMAIL)
        
        password_field.clear()
        password_field.send_keys(self.TEST_PASSWORD)
        
        print(f"✓ Заполнена форма:")
        print(f"  Email: {self.TEST_EMAIL}")
        print(f"  Пароль: {'*' * len(self.TEST_PASSWORD)}")
        
        # Запоминаем текущий URL
        current_url = driver.current_url
        
        # Кликаем кнопку входа
        print("✓ Нажимаем кнопку входа")
        login_button.click()
        
        # Ждем ответа
        time.sleep(5)
        
        # Проверяем результат
        new_url = driver.current_url
        print(f"✓ Текущий URL: {new_url}")
        
        if new_url != current_url:
            print(f"✓ Произошел редирект - вероятно успешный вход")
            print(f"  С {current_url} на {new_url}")
            return True
        else:
            print("ℹ Редиректа не произошло")
            
            # Проверяем наличие ошибок
            error_elements = driver.find_elements(*self.ERROR_MESSAGE)
            if error_elements:
                print(f"✗ Отображена ошибка: {error_elements[0].text}")
            else:
                print("ℹ Ошибок не отображено")
            
            return False
    
    def test_close_auth_modal(self, driver, base_url):
        """Тест 8: Закрытие модального окна авторизации"""
        print("\n" + "="*60)
        print("ТЕСТ 8: Закрытие модального окна авторизации")
        print("="*60)
        
        if not self.test_navigation_to_auth_from_hero_button(driver, base_url):
            return False
        
        time.sleep(2)
        
        # Ищем кнопку закрытия
        close_buttons = driver.find_elements(*self.CLOSE_BUTTON)
        if close_buttons:
            close_button = close_buttons[0]
            print(f"✓ Найдена кнопка закрытия: {close_button.get_attribute('aria-label') or close_button.text}")
            
            # Кликаем
            close_button.click()
            time.sleep(2)
            
            # Проверяем, что форма исчезла
            auth_elements = driver.find_elements(*self.AUTH_MODAL_TITLE)
            if not auth_elements:
                print("✓ Форма авторизации закрыта")
                return True
            else:
                print("✗ Форма авторизации не закрылась")
                return False
        else:
            print("ℹ Кнопка закрытия не найдена, пробуем ESC")
            
            # Пробуем закрыть через ESC
            from selenium.webdriver.common.keys import Keys
            email_fields = driver.find_elements(*self.EMAIL_FIELD)
            if email_fields:
                email_fields[0].send_keys(Keys.ESCAPE)
                time.sleep(2)
                
                auth_elements = driver.find_elements(*self.AUTH_MODAL_TITLE)
                if not auth_elements:
                    print("✓ Форма закрыта по ESC")
                    return True
            
            print("✗ Не удалось закрыть форму")
            return False
    
    def test_form_accessibility(self, driver, base_url):
        """Тест 9: Проверка доступности формы (табуляция, labels)"""
        print("\n" + "="*60)
        print("ТЕСТ 9: Проверка доступности формы")
        print("="*60)
        
        if not self.test_navigation_to_auth_from_hero_button(driver, base_url):
            return False
        
        time.sleep(2)
        
        accessibility_issues = []
        
        # 1. Проверяем наличие labels
        email_fields = driver.find_elements(*self.EMAIL_FIELD)
        if email_fields:
            email_id = email_fields[0].get_attribute("id")
            if email_id:
                labels = driver.find_elements(By.XPATH, f"//label[@for='{email_id}']")
                if labels:
                    print(f"✓ У поля email есть label: {labels[0].text}")
                else:
                    print("ℹ У поля email нет label")
                    accessibility_issues.append("email_no_label")
        
        # 2. Проверяем табуляцию
        print("✓ Проверяем порядок табуляции...")
        
        # Находим все интерактивные элементы
        interactive_elements = driver.find_elements(By.XPATH, "//input, //button, //a[@href]")
        print(f"  Всего интерактивных элементов: {len(interactive_elements)}")
        
        # Проверяем tabindex
        for i, elem in enumerate(interactive_elements[:10]):  # Первые 10
            tabindex = elem.get_attribute("tabindex")
            if tabindex:
                print(f"  Элемент {i}: tabindex={tabindex}")
        
        # 3. Проверяем ARIA атрибуты
        form_elements = driver.find_elements(By.XPATH, "//form//*[@aria-label or @aria-describedby]")
        print(f"✓ Элементов с ARIA атрибутами: {len(form_elements)}")
        
        return len(accessibility_issues) == 0
    
    def run_all_auth_tests(self, driver, base_url):
        """Запуск всех тестов авторизации"""
        print("\n" + "="*80)
        print("ЗАПУСК ВСЕХ ТЕСТОВ АВТОРИЗАЦИИ TASKFLOW")
        print("="*80)
        
        test_results = {}
        
        # Список тестов для запуска
        tests = [
            ("Навигация с главной", self.test_navigation_to_auth_from_hero_button),
            ("Навигация из CTA", self.test_navigation_to_auth_from_cta_section),
            ("Элементы формы", self.test_auth_form_elements),
            ("Переключение пароля", self.test_password_visibility_toggle),
            ("Валидация пустой формы", self.test_empty_form_validation),
            ("Валидация email", self.test_invalid_email_format),
            ("Попытка входа", self.test_successful_login_attempt),
            ("Закрытие формы", self.test_close_auth_modal),
            ("Доступность", self.test_form_accessibility),
        ]
        
        for test_name, test_func in tests:
            try:
                print(f"\n▶ Запуск теста: {test_name}")
                result = test_func(driver, base_url)
                test_results[test_name] = "PASS" if result else "FAIL"
                print(f"  Результат: {'✓ PASS' if result else '✗ FAIL'}")
                
                # Небольшая пауза между тестами
                time.sleep(2)
                
            except Exception as e:
                print(f"✗ Ошибка в тесте '{test_name}': {str(e)}")
                test_results[test_name] = "ERROR"
        
        # Выводим итоговую статистику
        print("\n" + "="*80)
        print("ИТОГИ ТЕСТИРОВАНИЯ")
        print("="*80)
        
        passed = sum(1 for result in test_results.values() if result == "PASS")
        failed = sum(1 for result in test_results.values() if result == "FAIL")
        errors = sum(1 for result in test_results.values() if result == "ERROR")
        
        print(f"✓ Пройдено: {passed}")
        print(f"✗ Провалено: {failed}")
        print(f"⚠ Ошибок: {errors}")
        print(f"📊 Всего тестов: {len(test_results)}")
        
        # Детализация по тестам
        print("\nДетализация:")
        for test_name, result in test_results.items():
            status_symbol = "✓" if result == "PASS" else "✗" if result == "FAIL" else "⚠"
            print(f"  {status_symbol} {test_name}: {result}")
        
        return test_results


# Функция для быстрого запуска всех тестов
def run_auth_tests(driver, base_url):
    """Запуск всех тестов авторизации"""
    tester = TestTaskFlowAuth()
    return tester.run_all_auth_tests(driver, base_url)