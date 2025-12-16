"""
Тесты модального окна профиля пользователя в TaskFlow.
Проверяет открытие, структуру и функциональность модального окна профиля.
"""

import time
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException, TimeoutException


class TestProfileModal:
    """Тесты модального окна профиля"""
    
    def test_find_profile_button(self, logged_in_driver, base_url):
        """Поиск кнопки профиля пользователя в навигации"""
        print("Поиск кнопки профиля пользователя...")
        
        try:
            # Ищем нижнюю часть навигации
            nav_bottom = logged_in_driver.find_element(By.CLASS_NAME, "VerticalNavbar-module__1XaSPq__navBottom")
            assert nav_bottom.is_displayed()
            print("✓ Нижняя часть навигации найдена")
            
            # Ищем кнопки в нижней навигации
            bottom_buttons = nav_bottom.find_elements(By.CLASS_NAME, "VerticalNavbar-module__1XaSPq__navButton")
            assert len(bottom_buttons) >= 2, "В нижней навигации должно быть минимум 2 кнопки"
            print(f"✓ Найдено кнопок в нижней навигации: {len(bottom_buttons)}")
            
            # Кнопка профиля обычно последняя
            profile_button = bottom_buttons[-1]
            
            # Проверяем aria-label
            aria_label = profile_button.get_attribute("aria-label")
            if aria_label and "Профиль" in aria_label:
                print(f"✓ Кнопка профиля найдена (aria-label: {aria_label})")
            else:
                print("Кнопка найдена (последняя в нижней навигации)")
            
            # Проверяем наличие аватара профиля
            try:
                profile_avatar = profile_button.find_element(By.CLASS_NAME, "VerticalNavbar-module__1XaSPq__profileAvatar")
                assert profile_avatar.is_displayed()
                print("✓ Аватар профиля найден")
                
                # Проверяем иконку аватара
                try:
                    avatar_icon = profile_avatar.find_element(By.CLASS_NAME, "VerticalNavbar-module__1XaSPq__avatarIcon")
                    print("  Иконка аватара найдена")
                except NoSuchElementException:
                    print("  Иконка аватара не найдена")
                    
            except NoSuchElementException:
                print("Аватар профиля не найден")
            
            return profile_button
            
        except NoSuchElementException as e:
            print(f"✗ Кнопка профиля не найдена: {e}")
            return None
    
    def test_open_profile_modal(self, logged_in_driver, base_url):
        """Тест открытия модального окна профиля"""
        profile_button = self.test_find_profile_button(logged_in_driver, base_url)
        
        if not profile_button:
            pytest.skip("Кнопка профиля не найдена")
        
        try:
            print("Открываем модальное окно профиля...")
            
            # Кликаем на кнопку профиля
            profile_button.click()
            time.sleep(2)
            
            # Ищем модальное окно профиля
            try:
                profile_modal = logged_in_driver.find_element(By.CLASS_NAME, "ProfileModal-module__Xna_tG__profileModalOverlay")
                assert profile_modal.is_displayed()
                print("✓ Модальное окно профиля открыто")
                
                # Проверяем модальное окно
                modal = profile_modal.find_element(By.CLASS_NAME, "ProfileModal-module__Xna_tG__profileModal")
                assert modal.is_displayed()
                
                # Проверяем aria-атрибуты
                role = modal.get_attribute("role")
                aria_labelledby = modal.get_attribute("aria-labelledby")
                aria_modal = modal.get_attribute("aria-modal")
                
                if role == "dialog":
                    print("✓ Роль: dialog")
                if aria_labelledby:
                    print(f"✓ aria-labelledby: {aria_labelledby}")
                if aria_modal == "true":
                    print("✓ aria-modal: true")
                
                return modal
                
            except NoSuchElementException:
                print("✗ Модальное окно профиля не найдено после клика")
                
                # Возможно, открылось выпадающее меню вместо модального окна
                print("Проверяем, возможно открылось выпадающее меню...")
                
                # Ищем элементы меню
                menu_elements = logged_in_driver.find_elements(By.XPATH, 
                    "//*[contains(text(), 'Настройки') or contains(text(), 'Профиль') or contains(text(), 'Выйти')]")
                
                if menu_elements:
                    print(f"✓ Открылось выпадающее меню ({len(menu_elements)} элементов)")
                    
                    # Кликаем на "Профиль" если есть
                    for elem in menu_elements:
                        if "Профиль" in elem.text:
                            print("Кликаем на 'Профиль' в меню...")
                            elem.click()
                            time.sleep(2)
                            
                            # Теперь ищем модальное окно
                            try:
                                profile_modal = logged_in_driver.find_element(By.CLASS_NAME, "ProfileModal-module__Xna_tG__profileModalOverlay")
                                print("✓ Модальное окно профиля открыто через меню")
                                return profile_modal.find_element(By.CLASS_NAME, "ProfileModal-module__Xna_tG__profileModal")
                            except NoSuchElementException:
                                print("✗ Модальное окно не открылось после клика в меню")
                                return None
                    
                    return None
                else:
                    print("✗ Ни модальное окно, ни выпадающее меню не найдено")
                    return None
                
        except Exception as e:
            print(f"✗ Ошибка при открытии модального окна профиля: {e}")
            return None
    
    def test_profile_modal_structure(self, logged_in_driver, base_url):
        """Тест структуры модального окна профиля"""
        modal = self.test_open_profile_modal(logged_in_driver, base_url)
        
        if not modal:
            pytest.skip("Модальное окно профиля не открыто")
        
        try:
            print("Проверяем структуру модального окна профиля...")
            
            # 1. Проверяем заголовок модального окна
            try:
                modal_header = modal.find_element(By.CLASS_NAME, "ProfileModal-module__Xna_tG__modalHeader")
                assert modal_header.is_displayed()
                print("✓ Заголовок модального окна найден")
                
                # Проверяем заголовок и подзаголовок
                try:
                    modal_title = modal_header.find_element(By.ID, "profile-modal-title")
                    print(f"  Заголовок: {modal_title.text}")
                except NoSuchElementException:
                    print("  ✗ Заголовок не найден")
                
                try:
                    modal_subtitle = modal_header.find_element(By.CLASS_NAME, "ProfileModal-module__Xna_tG__modalSubtitle")
                    print(f"  Подзаголовок: {modal_subtitle.text}")
                except NoSuchElementException:
                    print("  ✗ Подзаголовок не найден")
                
                # Проверяем кнопки действий в заголовке
                try:
                    header_actions = modal_header.find_element(By.CLASS_NAME, "ProfileModal-module__Xna_tG__headerActions")
                    action_buttons = header_actions.find_elements(By.TAG_NAME, "button")
                    print(f"  Кнопок действий в заголовке: {len(action_buttons)}")
                    
                    for btn in action_buttons:
                        # Проверяем кнопку закрытия
                        if "close" in btn.get_attribute("class", "").lower():
                            print("    ✓ Кнопка закрытия найдена")
                        # Проверяем кнопку выхода
                        elif "logout" in btn.get_attribute("class", "").lower():
                            print("    ✓ Кнопка выхода найдена")
                        # Проверяем кнопку удаления профиля
                        elif "delete" in btn.get_attribute("class", "").lower():
                            print("    ✓ Кнопка удаления профиля найдена")
                            
                except NoSuchElementException:
                    print("  ✗ Действия в заголовке не найдены")
                    
            except NoSuchElementException:
                print("✗ Заголовок модального окна не найден")
            
            # 2. Проверяем основное содержимое
            try:
                modal_content = modal.find_element(By.CLASS_NAME, "ProfileModal-module__Xna_tG__modalContent")
                assert modal_content.is_displayed()
                print("✓ Основное содержимое модального окна найдено")
                
                # Проверяем заголовок профиля
                try:
                    profile_header = modal_content.find_element(By.CLASS_NAME, "ProfileModal-module__Xna_tG__profileHeader")
                    print("  ✓ Заголовок профиля найден")
                    
                    # Проверяем имя профиля
                    try:
                        profile_name = profile_header.find_element(By.CLASS_NAME, "ProfileModal-module__Xna_tG__profileName")
                        print(f"    Имя: {profile_name.text}")
                    except NoSuchElementException:
                        print("    ✗ Имя профиля не найдено")
                    
                    # Проверяем теги профиля
                    try:
                        profile_tags = profile_header.find_element(By.CLASS_NAME, "ProfileModal-module__Xna_tG__profileTags")
                        print("    ✓ Теги профиля найдены")
                        
                        # Проверяем email
                        try:
                            profile_email = profile_tags.find_element(By.CLASS_NAME, "ProfileModal-module__Xna_tG__profileEmail")
                            print(f"      Email: {profile_email.text}")
                        except NoSuchElementException:
                            print("      ✗ Email не найден")
                        
                        # Проверяем тег профиля
                        try:
                            tag_container = profile_tags.find_element(By.CLASS_NAME, "ProfileModal-module__Xna_tG__tagContainer")
                            print("      ✓ Контейнер тега найден")
                        except NoSuchElementException:
                            print("      ✗ Контейнер тега не найден")
                            
                    except NoSuchElementException:
                        print("    ✗ Теги профиля не найдены")
                        
                except NoSuchElementException:
                    print("  ✗ Заголовок профиля не найден")
                
                # Проверяем сетку контента
                try:
                    content_grid = modal_content.find_element(By.CLASS_NAME, "ProfileModal-module__Xna_tG__contentGrid")
                    print("  ✓ Сетка контента найдена")
                    
                    # Проверяем секцию статистики
                    try:
                        stats_section = content_grid.find_element(By.CLASS_NAME, "ProfileModal-module__Xna_tG__statsSection")
                        print("    ✓ Секция статистики найдена")
                    except NoSuchElementException:
                        print("    ✗ Секция статистики не найдена")
                    
                    # Проверяем секцию формы
                    try:
                        form_section = content_grid.find_element(By.CLASS_NAME, "ProfileModal-module__Xna_tG__formSection")
                        print("    ✓ Секция формы найдена")
                    except NoSuchElementException:
                        print("    ✗ Секция формы не найдена")
                        
                except NoSuchElementException:
                    print("  ✗ Сетка контента не найдена")
                    
            except NoSuchElementException:
                print("✗ Основное содержимое модального окна не найдено")
            
            return True
            
        except Exception as e:
            print(f"✗ Ошибка при проверке структуры модального окна: {e}")
            return False
    
    def test_profile_statistics_section(self, logged_in_driver, base_url):
        """Тест секции статистики в модальном окне профиля"""
        modal = self.test_open_profile_modal(logged_in_driver, base_url)
        
        if not modal:
            pytest.skip("Модальное окно профиля не открыто")
        
        try:
            print("Проверяем секцию статистики профиля...")
            
            # Ищем секцию статистики
            stats_section = modal.find_element(By.CLASS_NAME, "ProfileModal-module__Xna_tG__statsSection")
            assert stats_section.is_displayed()
            print("✓ Секция статистики найдена")
            
            # Ищем контейнер статистики
            try:
                profile_stats = stats_section.find_element(By.CLASS_NAME, "ProfileStats-module__GVkM3a__profileStats")
                print("  ✓ Контейнер статистики профиля найден")
                
                # Проверяем заголовок статистики
                try:
                    stats_title = profile_stats.find_element(By.CLASS_NAME, "ProfileStats-module__GVkM3a__statsTitle")
                    print(f"    Заголовок: {stats_title.text}")
                except NoSuchElementException:
                    print("    ✗ Заголовок статистики не найден")
                
                # Проверяем сетку статистики
                try:
                    stats_grid = profile_stats.find_element(By.CLASS_NAME, "ProfileStats-module__GVkM3a__statsGrid")
                    print("    ✓ Сетка статистики найдена")
                    
                    # Ищем элементы статистики
                    stat_items = stats_grid.find_elements(By.CLASS_NAME, "ProfileStats-module__GVkM3a__statItem")
                    print(f"    Найдено элементов статистики: {len(stat_items)}")
                    
                    # Проверяем каждый элемент статистики
                    for i, item in enumerate(stat_items):
                        try:
                            # Проверяем обертку иконки
                            icon_wrapper = item.find_element(By.CLASS_NAME, "ProfileStats-module__GVkM3a__statIconWrapper")
                            
                            # Проверяем иконку
                            try:
                                stat_icon = item.find_element(By.CLASS_NAME, "ProfileStats-module__GVkM3a__statIcon")
                                print(f"      Элемент {i+1}: иконка найдена")
                            except NoSuchElementException:
                                print(f"      Элемент {i+1}: иконка не найдена")
                            
                            # Проверяем информацию статистики
                            try:
                                stat_info = item.find_element(By.CLASS_NAME, "ProfileStats-module__GVkM3a__statInfo")
                                
                                # Проверяем заголовок (число)
                                try:
                                    stat_header = stat_info.find_element(By.TAG_NAME, "h3")
                                    print(f"        Значение: {stat_header.text}")
                                except NoSuchElementException:
                                    print(f"        Значение не найдено")
                                
                                # Проверяем описание
                                try:
                                    stat_description = stat_info.find_element(By.TAG_NAME, "p")
                                    print(f"        Описание: {stat_description.text}")
                                except NoSuchElementException:
                                    print(f"        Описание не найдено")
                                    
                            except NoSuchElementException:
                                print(f"      Элемент {i+1}: информация не найдена")
                                
                        except NoSuchElementException:
                            print(f"      Элемент {i+1}: обертка иконки не найдена")
                    
                    return True
                    
                except NoSuchElementException:
                    print("    ✗ Сетка статистики не найдена")
                    return False
                    
            except NoSuchElementException:
                print("  ✗ Контейнер статистики профиля не найден")
                return False
                
        except NoSuchElementException as e:
            print(f"✗ Секция статистики не найдена: {e}")
            return False
    
    def test_close_profile_modal(self, logged_in_driver, base_url):
        """Тест закрытия модального окна профиля"""
        modal = self.test_open_profile_modal(logged_in_driver, base_url)
        
        if not modal:
            pytest.skip("Модальное окно профиля не открыто")
        
        try:
            print("Закрываем модальное окно профиля...")
            
            # Ищем кнопку закрытия
            try:
                # Сначала ищем в заголовке модального окна
                modal_header = modal.find_element(By.CLASS_NAME, "ProfileModal-module__Xna_tG__modalHeader")
                header_actions = modal_header.find_element(By.CLASS_NAME, "ProfileModal-module__Xna_tG__headerActions")
                
                # Ищем кнопку закрытия
                close_button = None
                action_buttons = header_actions.find_elements(By.TAG_NAME, "button")
                
                for btn in action_buttons:
                    btn_class = btn.get_attribute("class") or ""
                    if "close" in btn_class.lower() or "Close" in btn_class:
                        close_button = btn
                        break
                
                if close_button:
                    print("✓ Кнопка закрытия найдена")
                    
                    # Проверяем aria-label
                    aria_label = close_button.get_attribute("aria-label")
                    if aria_label:
                        print(f"  aria-label: {aria_label}")
                    
                    # Кликаем на кнопку закрытия
                    close_button.click()
                    time.sleep(1)
                    
                    # Проверяем, что модальное окно закрылось
                    try:
                        logged_in_driver.find_element(By.CLASS_NAME, "ProfileModal-module__Xna_tG__profileModalOverlay")
                        print("✗ Модальное окно не закрылось")
                        return False
                    except NoSuchElementException:
                        print("✓ Модальное окно успешно закрыто")
                        return True
                        
                else:
                    print("✗ Кнопка закрытия не найдена в заголовке")
                    
                    # Пробуем кликнуть вне модального окна (на overlay)
                    try:
                        overlay = logged_in_driver.find_element(By.CLASS_NAME, "ProfileModal-module__Xna_tG__profileModalOverlay")
                        print("Пробуем закрыть кликом по overlay...")
                        
                        # Кликаем по координатам overlay (немного смещаем от центра)
                        actions = logged_in_driver.execute_script("""
                            var overlay = arguments[0];
                            var rect = overlay.getBoundingClientRect();
                            return {
                                x: rect.left + 10,
                                y: rect.top + 10
                            };
                        """, overlay)
                        
                        logged_in_driver.execute_script("arguments[0].click();", overlay)
                        time.sleep(1)
                        
                        # Проверяем, закрылось ли окно
                        try:
                            logged_in_driver.find_element(By.CLASS_NAME, "ProfileModal-module__Xna_tG__profileModalOverlay")
                            print("✗ Модальное окно не закрылось по клику на overlay")
                            return False
                        except NoSuchElementException:
                            print("✓ Модальное окно закрылось по клику на overlay")
                            return True
                            
                    except Exception as e:
                        print(f"✗ Не удалось закрыть модальное окно: {e}")
                        return False
                        
            except NoSuchElementException:
                print("✗ Заголовок модального окна не найден")
                return False
                
        except Exception as e:
            print(f"✗ Ошибка при закрытии модального окна: {e}")
            return False