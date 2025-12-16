from selenium.webdriver.common.by import By
import time

class TestWelcomePage:
    """Тесты главной страницы TaskFlow"""
    
    def test_page_loads(self, driver, base_url):
        """Тест загрузки главной страницы"""
        driver.get(base_url)
        time.sleep(3)
        assert len(driver.page_source) > 0
    
    def test_logo_presence(self, driver, base_url):
        """Тест наличия логотипа TASKFLOW"""
        driver.get(base_url)
        time.sleep(3)
        logo_elements = driver.find_elements(By.XPATH, "//*[contains(text(), 'TASKFLOW')]")
        assert len(logo_elements) > 0
    
    def test_hero_section_content(self, driver, base_url):
        """Тест hero-секции с заголовком и кнопкой"""
        driver.get(base_url)
        time.sleep(3)
        h1_elements = driver.find_elements(By.TAG_NAME, "h1")
        assert len(h1_elements) > 0
        cta_found = False
        buttons = driver.find_elements(By.TAG_NAME, "button")
        for btn in buttons:
            btn_text = btn.text.strip()
            if "Начать работу" in btn_text or "Начать" in btn_text:
                cta_found = True
                break
        assert cta_found
    
    def test_about_section_presence(self, driver, base_url):
        """Тест секции 'О приложении'"""
        driver.get(base_url)
        time.sleep(3)
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight / 2);")
        time.sleep(2)
        about_texts = ["Преобразите", "рабочий", "процесс", "TASKFLOW", "объединяет"]
        found_count = 0
        for text in about_texts:
            elements = driver.find_elements(By.XPATH, f"//*[contains(text(), '{text}')]")
            if elements:
                found_count += 1
        assert found_count >= 2
    
    def test_carousel_section(self, driver, base_url):
        """Тест карусели с функциями приложения"""
        driver.get(base_url)
        time.sleep(3)
        driver.execute_script("window.scrollTo(0, 800);")
        time.sleep(2)
        slides = driver.find_elements(By.XPATH, "//*[contains(text(), 'Интуитивные доски') or contains(text(), 'Командная работа') or contains(text(), 'Умные заметки')]")
        assert len(slides) > 0
    
    def test_stats_section(self, driver, base_url):
        """Тест секции статистики"""
        driver.get(base_url)
        time.sleep(3)
        driver.execute_script("window.scrollTo(0, 1200);")
        time.sleep(2)
        stats = ["99.9%", "10K+", "50+", "24/7", "Активных", "Интеграций", "Поддержка"]
        found_stats = []
        for stat in stats:
            elements = driver.find_elements(By.XPATH, f"//*[contains(text(), '{stat}')]")
            if elements:
                found_stats.append(stat)
        assert len(found_stats) >= 2
    
    def test_gallery_section(self, driver, base_url):
        """Тест галереи возможностей"""
        driver.get(base_url)
        time.sleep(3)
        driver.execute_script("window.scrollTo(0, 1600);")
        time.sleep(2)
        gallery_items = driver.find_elements(By.XPATH, "//*[contains(text(), 'Управление проектами') or contains(text(), 'Командное взаимодействие') or contains(text(), 'Аналитика и отчеты')]")
        assert len(gallery_items) > 0
    
    def test_domestic_section(self, driver, base_url):
        """Тест секции 'Отечественная разработка'"""
        driver.get(base_url)
        time.sleep(3)
        driver.execute_script("window.scrollTo(0, 2000);")
        time.sleep(2)
        domestic_texts = ["Отечественная", "разработка", "России", "российских", "Серверы"]
        found_count = 0
        for text in domestic_texts:
            elements = driver.find_elements(By.XPATH, f"//*[contains(text(), '{text}')]")
            if elements:
                found_count += 1
        assert found_count >= 2
    
    def test_cta_button_functionality(self, driver, base_url):
        """Тест клика по кнопке 'Начать работу'"""
        driver.get(base_url)
        time.sleep(3)
        start_buttons = driver.find_elements(By.XPATH, "//button[contains(text(), 'Начать работу')]")
        if not start_buttons:
            start_buttons = driver.find_elements(By.XPATH, "//button[contains(text(), 'Начать')]")
        if len(start_buttons) > 0:
            start_buttons[0].click()
            time.sleep(3)
    
    def test_footer_section(self, driver, base_url):
        """Тест футера страницы"""
        driver.get(base_url)
        time.sleep(3)
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(2)
        footer_texts = ["©", "2025", "TASKFLOW", "Все права", "Политика", "Условия"]
        found_count = 0
        for text in footer_texts:
            elements = driver.find_elements(By.XPATH, f"//*[contains(text(), '{text}')]")
            if elements:
                found_count += 1
        assert found_count >= 3
    
    def test_social_links(self, driver, base_url):
        """Тест социальных ссылок в футере"""
        driver.get(base_url)
        time.sleep(3)
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(2)
        svg_icons = driver.find_elements(By.TAG_NAME, "svg")
        assert len(svg_icons) > 0
    
    def test_navigation_links(self, driver, base_url):
        """Тест навигационных ссылок в футере"""
        driver.get(base_url)
        time.sleep(3)
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(2)
        link_texts = ["Функции", "Интеграции", "Цены", "Документация", "Блог", "О нас", "Контакты"]
        found_links = []
        for text in link_texts:
            elements = driver.find_elements(By.XPATH, f"//a[contains(text(), '{text}')]")
            if elements:
                found_links.append(text)
        assert len(found_links) > 0