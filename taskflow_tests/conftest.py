import pytest
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import time
import os

def pytest_addoption(parser):
    parser.addoption("--headless", action="store_true", default=False, help="Запуск браузера в headless режиме")
    parser.addoption("--base-url", action="store", default="http://localhost:3000/welcome", help="Базовый URL приложения")
    parser.addoption("--wait-time", action="store", default="5", help="Время ожидания загрузки страницы (секунды)")
    parser.addoption("--username", action="store", default="test@mail.ru", help="Имя пользователя для авторизации")
    parser.addoption("--password", action="store", default="Password1234", help="Пароль для авторизации")

@pytest.fixture(scope="session")
def username(request):
    """Фикстура для имени пользователя"""
    return request.config.getoption("--username")

@pytest.fixture(scope="session")
def password(request):
    """Фикстура для пароля"""
    return request.config.getoption("--password")

@pytest.fixture(scope="session")
def base_url(request):
    """Фикстура для базового URL"""
    return request.config.getoption("--base-url")

@pytest.fixture(scope="session")
def wait_time(request):
    """Фикстура для времени ожидания"""
    return int(request.config.getoption("--wait-time"))

def perform_login(driver, base_url, username, password):
    """Выполняет авторизацию пользователя"""
    print("\n  Выполнение авторизации...")
    
    try:
        # Переходим на страницу авторизации
        auth_url = base_url.replace("/welcome", "/auth")
        driver.get(auth_url)
        time.sleep(3)
        
        # Ищем поля для входа
        email_field = driver.find_element(By.XPATH, "//input[@type='email' or contains(@placeholder, 'email') or @name='email']")
        password_field = driver.find_element(By.XPATH, "//input[@type='password' or contains(@placeholder, 'пароль') or @name='password']")
        submit_button = driver.find_element(By.XPATH, "//button[@type='submit' or contains(text(), 'Войти') or contains(text(), 'войти')]")
        
        # Вводим данные
        email_field.clear()
        email_field.send_keys(username)
        
        password_field.clear()
        password_field.send_keys(password)
        
        # Кликаем на кнопку входа
        submit_button.click()
        time.sleep(5)
        
        # Проверяем успешность входа
        current_url = driver.current_url
        print(f"Текущий URL после входа: {current_url}")
        
        # Если остались на auth странице, значит вход не удался
        if "auth" in current_url.lower():
            print("  Авторизация не удалась. Пробуем альтернативный метод...")
            return False
        
        print("  Авторизация успешна")
        return True
        
    except Exception as e:
        print(f"  Ошибка при авторизации: {e}")
        return False

@pytest.fixture(scope="session")
def driver(request, base_url, wait_time, username, password):
    """Фикстура драйвера с scope session для использования в классах"""
    chrome_options = Options()
    
    # Настройки для headless режима
    if request.config.getoption("--headless"):
        chrome_options.add_argument("--headless=new")
        chrome_options.add_argument("--window-size=1920,1080")
    
    # Общие настройки
    chrome_options.add_argument("--start-maximized")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option('useAutomationExtension', False)
    
    # Настройки для уведомлений
    chrome_options.add_experimental_option("prefs", {
        "profile.default_content_setting_values.notifications": 2,
        "credentials_enable_service": False,
        "profile.password_manager_enabled": False
    })
    
    # Инициализация драйвера
    print(f"\n  Инициализация браузера...")
    service = Service(ChromeDriverManager().install())
    driver_instance = webdriver.Chrome(service=service, options=chrome_options)
    
    # Настройки драйвера
    driver_instance.implicitly_wait(10)
    driver_instance.set_page_load_timeout(30)
    
    # Устанавливаем размер окна
    driver_instance.set_window_size(1920, 1080)
    
    # Убираем идентификатор автоматизации
    driver_instance.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    
    # Автоматически переходим на базовый URL при создании драйвера
    print(f"  Переход на URL: {base_url}")
    try:
        driver_instance.get(base_url)
        print(f"  Ожидание загрузки страницы ({wait_time} секунд)...")
        time.sleep(wait_time)
        
        # Проверяем, загрузилась ли страница
        current_url = driver_instance.current_url
        print(f"  Текущий URL: {current_url}")
        
        page_source_length = len(driver_instance.page_source)
        print(f"  Размер страницы: {page_source_length} символов")
        
        if page_source_length < 100:
            print("  Предупреждение: страница может быть не загружена полностью")
        
    except Exception as e:
        print(f"  Ошибка при загрузке страницы: {e}")
        print("Продолжаем выполнение тестов...")
    
    yield driver_instance
    
    # Закрытие драйвера
    print(f"\n  Закрытие браузера...")
    driver_instance.quit()

@pytest.fixture(scope="function")
def wait(driver):
    from selenium.webdriver.support.ui import WebDriverWait
    return WebDriverWait(driver, 20)

@pytest.fixture(scope="function")
def logged_in_driver(driver, base_url, username, password):
    """Фикстура для авторизованного драйвера"""
    # Проверяем, не авторизованы ли мы уже
    current_url = driver.current_url
    
    # Если мы уже на главной странице после входа, проверяем элементы
    if current_url != base_url and "welcome" not in current_url.lower():
        print("Пользователь уже авторизован")
        return driver
    
    # Выполняем авторизацию
    if not perform_login(driver, base_url, username, password):
        # Если не удалось авторизоваться, просто возвращаем драйвер
        print(" Продолжаем без авторизации")
    
    return driver