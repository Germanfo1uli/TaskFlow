from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
import time

class TestHelpers:
    """Вспомогательные функции для тестов"""
    
    @staticmethod
    def wait_for_element(driver, locator, timeout=10):
        """Ожидание появления элемента"""
        return WebDriverWait(driver, timeout).until(
            EC.presence_of_element_located(locator)
        )
    
    @staticmethod
    def wait_for_element_visible(driver, locator, timeout=10):
        """Ожидание видимости элемента"""
        return WebDriverWait(driver, timeout).until(
            EC.visibility_of_element_located(locator)
        )
    
    @staticmethod
    def wait_for_element_clickable(driver, locator, timeout=10):
        """Ожидание кликабельности элемента"""
        return WebDriverWait(driver, timeout).until(
            EC.element_to_be_clickable(locator)
        )
    
    @staticmethod
    def take_screenshot(driver, name):
        """Создание скриншота"""
        timestamp = time.strftime("%Y%m%d_%H%M%S")
        filename = f"screenshots/{name}_{timestamp}.png"
        driver.save_screenshot(filename)
        return filename
    
    @staticmethod
    def scroll_to_element(driver, element):
        """Прокрутка к элементу"""
        driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", element)
        time.sleep(1)
    
    @staticmethod
    def is_element_present(driver, by, value):
        """Проверка наличия элемента"""
        try:
            driver.find_element(by, value)
            return True
        except:
            return False