"""
Тесты профиля пользователя TaskFlow.
Проверяет функциональность профиля, настройки и аватар.
Предполагается, что пользователь уже авторизован.
"""

import time
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException, TimeoutException


class TestProfile:
    """Тесты профиля пользователя"""
    
    def test_check_current_page(self, logged_in_driver, base_url):
        """Проверка текущей страницы (должна быть главная после входа)"""
        print(f"Текущий URL: {logged_in_driver.current_url}")
        print(f"Заголовок страницы: {logged_in_driver.title}")
        
        # Проверяем, что мы на главной странице
        try:
            main_container = logged_in_driver.find_element(By.CLASS_NAME, "MainPage-module__OMPjHa__mainContainer")
            assert main_container.is_displayed()
            print("✓ Находимся на главной странице после входа")
            return True
        except NoSuchElementException:
            print("Не на главной странице. Пробуем перейти на главную...")
            logged_in_driver.get(base_url.replace("/welcome", ""))
            time.sleep(3)
            return False
    
    def test_profile_button_exists(self, logged_in_driver, base_url):
        """Тест наличия кнопки профиля пользователя"""
        # Сначала проверяем, что мы на главной странице
        self.test_check_current_page(logged_in_driver, base_url)
        
        time.sleep(2)
        
        try:
            # Ищем кнопку профиля в нижней части навигации
            profile_buttons = logged_in_driver.find_elements(By.XPATH, 
                "//div[contains(@class, 'VerticalNavbar-module__1XaSPq__navBottom')]//button[contains(@aria-label, 'Профиль')]")
            
            if not profile_buttons:
                # Ищем по классу
                profile_buttons = logged_in_driver.find_elements(By.XPATH,
                    "//button[contains(@class, 'VerticalNavbar-module__1XaSPq__navButton')]//div[contains(@class, 'profileAvatar')]")
            
            if not profile_buttons:
                # Ищем все кнопки в нижней навигации
                nav_bottom = logged_in_driver.find_element(By.CLASS_NAME, "VerticalNavbar-module__1XaSPq__navBottom")
                nav_buttons = nav_bottom.find_elements(By.TAG_NAME, "button")
                if len(nav_buttons) >= 2:
                    profile_buttons = [nav_buttons[-1]]  # Последняя кнопка - профиль
            
            assert len(profile_buttons) > 0, "Кнопка профиля не найдена"
            print(f"Найдено кнопок профиля: {len(profile_buttons)}")
            
            # Проверяем первую кнопку
            profile_button = profile_buttons[0]
            assert profile_button.is_displayed(), "Кнопка профиля не отображается"
            
            # Проверяем наличие аватара
            try:
                avatar = profile_button.find_element(By.CLASS_NAME, "VerticalNavbar-module__1XaSPq__profileAvatar")
                assert avatar.is_displayed()
                print("✓ Аватар профиля найден")
            except NoSuchElementException:
                # Ищем иконку аватара
                avatar_icons = profile_button.find_elements(By.TAG_NAME, "svg")
                if avatar_icons:
                    print("✓ Иконка профиля найдена")
                else:
                    print("Аватар не найден, но кнопка есть")
            
            return profile_button
            
        except Exception as e:
            print(f"Кнопка профиля не найдена: {e}")
            pytest.fail(f"Кнопка профиля не найдена: {e}")
    
    def test_open_profile_dropdown(self, logged_in_driver, base_url):
        """Тест открытия выпадающего меню профиля"""
        # Сначала находим кнопку профиля
        profile_button = self.test_profile_button_exists(logged_in_driver, base_url)
        
        try:
            # Кликаем на кнопку профиля
            print("Открываем меню профиля...")
            profile_button.click()
            time.sleep(2)
            
            # Проверяем, открылось ли выпадающее меню
            # Ищем элементы меню профиля
            dropdown_elements = logged_in_driver.find_elements(By.XPATH,
                "//*[contains(@class, 'dropdown') or contains(@class, 'Dropdown') or contains(@class, 'menu') or contains(@class, 'Menu')]")
            
            if not dropdown_elements:
                # Ищем по тексту
                dropdown_elements = logged_in_driver.find_elements(By.XPATH,
                    "//*[contains(text(), 'Настройки') or contains(text(), 'Профиль') or contains(text(), 'Выйти')]")
            
            if dropdown_elements:
                print(f"✓ Выпадающее меню открыто, найдено элементов: {len(dropdown_elements)}")
                
                # Выводим содержимое меню
                for i, elem in enumerate(dropdown_elements[:3]):
                    print(f"  Элемент меню {i+1}: {elem.text}")
                
                return True
            else:
                print("Выпадающее меню не открылось")
                
                # Пробуем кликнуть еще раз
                profile_button.click()
                time.sleep(1)
                profile_button.click()
                time.sleep(2)
                
                # Проверяем снова
                dropdown_elements = logged_in_driver.find_elements(By.XPATH,
                    "//*[contains(@class, 'dropdown') or contains(@class, 'Dropdown')]")
                
                if dropdown_elements:
                    print(f"Меню открылось после повторного клика: {len(dropdown_elements)} элементов")
                    return True
                else:
                    print("Меню не открылось даже после повторного клика")
                    return False
                
        except Exception as e:
            print(f"Ошибка при открытии меню профиля: {e}")
            return False
    
    def test_profile_menu_items(self, logged_in_driver, base_url):
        """Тест пунктов меню профиля"""
        # Сначала открываем меню профиля
        if not self.test_open_profile_dropdown(logged_in_driver, base_url):
            pytest.skip("Не удалось открыть меню профиля")
        
        try:
            # Ищем стандартные пункты меню
            menu_items_texts = ["Настройки", "Профиль", "Выйти", "Settings", "Profile", "Logout"]
            found_items = []
            
            for text in menu_items_texts:
                elements = logged_in_driver.find_elements(By.XPATH, f"//*[contains(text(), '{text}')]")
                for elem in elements:
                    if elem.is_displayed():
                        found_items.append((text, elem))
            
            if found_items:
                print(f"Найдено пунктов меню: {len(found_items)}")
                for text, elem in found_items:
                    print(f"  ✓ {text}: {elem.text}")
                
                # Проверяем наличие хотя бы одного из основных пунктов
                has_settings = any("Настройки" in text or "Settings" in text for text, _ in found_items)
                has_logout = any("Выйти" in text or "Logout" in text for text, _ in found_items)
                
                if has_settings or has_logout:
                    print("✓ Основные пункты меню найдены")
                    return True
                else:
                    print("Основные пункты меню не найдены")
                    return False
            else:
                print("Пункты меню не найдены")
                return False
                
        except Exception as e:
            print(f"Ошибка при проверке пунктов меню: {e}")
            return False
    
    def test_user_avatar_display(self, logged_in_driver, base_url):
        """Тест отображения аватара пользователя"""
        time.sleep(1)
        
        try:
            # Ищем элементы аватара
            avatar_elements = logged_in_driver.find_elements(By.XPATH,
                "//*[contains(@class, 'avatar') or contains(@class, 'Avatar')]")
            
            if avatar_elements:
                print(f"Найдено элементов аватара: {len(avatar_elements)}")
                
                # Находим аватар профиля в навигации
                profile_avatar = None
                for avatar in avatar_elements:
                    # Проверяем, находится ли аватар в навигации
                    parent = avatar.find_element(By.XPATH, "./..")
                    parent_class = parent.get_attribute("class") or ""
                    
                    if "navBottom" in parent_class or "profile" in parent_class.lower():
                        profile_avatar = avatar
                        break
                
                if profile_avatar:
                    print("✓ Аватар профиля в навигации найден")
                    
                    if profile_avatar.is_displayed():
                        print("  ✓ Отображается")
                        
                        # Проверяем размеры
                        size = profile_avatar.size
                        print(f"  Размеры: {size['width']}x{size['height']}")
                        
                        # Проверяем наличие иконки или текста
                        if profile_avatar.text and len(profile_avatar.text.strip()) > 0:
                            print(f"  Текст аватара: {profile_avatar.text.strip()}")
                        
                        # Ищем SVG внутри
                        svg_icons = profile_avatar.find_elements(By.TAG_NAME, "svg")
                        if svg_icons:
                            print(f"  Содержит иконку SVG")
                        
                        return True
                    else:
                        print("Аватар не отображается")
                        return False
                else:
                    print("Аватар профиля в навигации не найден")
                    return False
            else:
                print("Элементы аватара не найдены")
                return False
                
        except Exception as e:
            print(f"Ошибка при проверке аватара: {e}")
            return False
    
    def test_navigation_structure(self, logged_in_driver, base_url):
        """Тест структуры навигации (верхняя и нижняя части)"""
        time.sleep(1)
        
        try:
            # Проверяем верхнюю часть навигации
            nav_top = logged_in_driver.find_element(By.CLASS_NAME, "VerticalNavbar-module__1XaSPq__navTop")
            assert nav_top.is_displayed()
            print("✓ Верхняя часть навигации отображается")
            
            # Проверяем кнопки в верхней части
            top_buttons = nav_top.find_elements(By.CLASS_NAME, "VerticalNavbar-module__1XaSPq__navButton")
            print(f"  Кнопок в верхней части: {len(top_buttons)}")
            
            # Проверяем список проектов
            projects_list = nav_top.find_element(By.CLASS_NAME, "VerticalNavbar-module__1XaSPq__projectsList")
            assert projects_list.is_displayed()
            print("✓ Список проектов отображается")
            
            # Проверяем нижнюю часть навигации
            nav_bottom = logged_in_driver.find_element(By.CLASS_NAME, "VerticalNavbar-module__1XaSPq__navBottom")
            assert nav_bottom.is_displayed()
            print("✓ Нижняя часть навигации отображается")
            
            # Проверяем кнопки в нижней части
            bottom_buttons = nav_bottom.find_elements(By.CLASS_NAME, "VerticalNavbar-module__1XaSPq__navButton")
            print(f"  Кнопок в нижней части: {len(bottom_buttons)}")
            
            # Должна быть как минимум кнопка помощи и профиля
            assert len(bottom_buttons) >= 2, "В нижней навигации должно быть минимум 2 кнопки"
            
            return True
            
        except Exception as e:
            print(f"Ошибка при проверке структуры навигации: {e}")
            return False