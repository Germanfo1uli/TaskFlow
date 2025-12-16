from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
import time

class TestNavigation:
    """Тесты навигации по сайту TaskFlow"""
    
    def test_scroll_to_sections(self, driver, base_url):
        """Тест прокрутки страницы до разных секций"""
        driver.get(base_url)
        time.sleep(3)
        initial_scroll = driver.execute_script("return window.pageYOffset;")
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight / 2);")
        time.sleep(2)
        middle_scroll = driver.execute_script("return window.pageYOffset;")
        assert middle_scroll > initial_scroll
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(2)
        final_scroll = driver.execute_script("return window.pageYOffset;")
        assert final_scroll > middle_scroll
        driver.execute_script("window.scrollTo(0, 0);")
        time.sleep(2)
        top_scroll = driver.execute_script("return window.pageYOffset;")
        assert top_scroll < final_scroll
    
    def test_keyboard_navigation(self, driver, base_url):
        """Тест навигации с клавиатуры (Tab)"""
        driver.get(base_url)
        time.sleep(3)
        body = driver.find_element(By.TAG_NAME, "body")
        body.click()
        for i in range(5):
            body.send_keys(Keys.TAB)
            time.sleep(0.5)
    
    def test_responsive_layout(self, driver, base_url):
        """Тест базовой адаптивности страницы"""
        driver.get(base_url)
        time.sleep(3)
        body = driver.find_element(By.TAG_NAME, "body")
        assert body.is_displayed()
    
    def test_page_refresh(self, driver, base_url):
        """Тест обновления страницы"""
        driver.get(base_url)
        time.sleep(3)
        initial_url = driver.current_url
        driver.refresh()
        time.sleep(3)
        refreshed_url = driver.current_url
        assert refreshed_url == initial_url
    
    def test_browser_back_forward(self, driver, base_url):
        """Тест кнопок назад/вперед в браузере"""
        driver.get(base_url)
        time.sleep(3)
        url1 = driver.current_url
        start_buttons = driver.find_elements(By.XPATH, "//button[contains(text(), 'Начать работу')]")
        if start_buttons:
            start_buttons[0].click()
            time.sleep(3)
            url2 = driver.current_url
            if url2 != url1:
                driver.back()
                time.sleep(3)
                driver.forward()
                time.sleep(3)