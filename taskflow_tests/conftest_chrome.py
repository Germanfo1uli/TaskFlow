import pytest
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.options import Options

@pytest.fixture(scope="function")
def driver():
    """Фикстура для инициализации драйвера Chrome"""
    chrome_options = Options()
    chrome_options.add_argument("--start-maximized")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    
    # Отключить уведомления
    chrome_options.add_experimental_option("prefs", {
        "profile.default_content_setting_values.notifications": 2
    })
    
    # Используем webdriver_manager для автоматической загрузки драйвера
    service = Service(ChromeDriverManager().install())
    driver_instance = webdriver.Chrome(service=service, options=chrome_options)
    
    # Устанавливаем неявное ожидание
    driver_instance.implicitly_wait(10)
    
    yield driver_instance
    
    # Закрытие драйвера после теста
    driver_instance.quit()

@pytest.fixture(scope="function")
def base_url():
    """Базовый URL тестируемого сайта"""
    return "http://localhost:3000/welcome"  # Ваш адрес

@pytest.fixture(scope="function")
def wait(driver):
    """Фикстура для WebDriverWait"""
    from selenium.webdriver.support.ui import WebDriverWait
    return WebDriverWait(driver, 10)
