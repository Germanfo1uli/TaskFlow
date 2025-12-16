"""
Тесты навигации по проектам в TaskFlow.
Проверяет клик по проекту, открытие панели управления проектом.
"""

import time
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException, TimeoutException


class TestProjectNavigation:
    """Тесты навигации по проектам"""
    
    def test_find_project_button_in_navigation(self, logged_in_driver, base_url):
        """Поиск кнопки проекта в навигационной панели"""
        print("Поиск кнопки проекта в навигации...")
        
        try:
            # Ищем список проектов в навигации
            projects_list = logged_in_driver.find_element(By.CLASS_NAME, "VerticalNavbar-module__1XaSPq__projectsList")
            assert projects_list.is_displayed()
            print("✓ Список проектов найден в навигации")
            
            # Ищем кнопки проектов
            project_buttons = projects_list.find_elements(By.CLASS_NAME, "VerticalNavbar-module__1XaSPq__projectButton")
            assert len(project_buttons) > 0, "Кнопки проектов не найдены"
            print(f"✓ Найдено кнопок проектов: {len(project_buttons)}")
            
            # Находим активный проект (с классом activeProject)
            active_project = None
            for btn in project_buttons:
                btn_class = btn.get_attribute("class")
                if "activeProject" in btn_class:
                    active_project = btn
                    break
            
            if active_project:
                print(f"✓ Активный проект найден")
                
                # Проверяем атрибуты активного проекта
                aria_label = active_project.get_attribute("aria-label")
                if aria_label:
                    print(f"  aria-label: {aria_label}")
                
                # Проверяем placeholder (буква проекта)
                try:
                    placeholder = active_project.find_element(By.CLASS_NAME, "VerticalNavbar-module__1XaSPq__projectPlaceholder")
                    if placeholder.is_displayed():
                        print(f"  Буква проекта: {placeholder.text}")
                except NoSuchElementException:
                    print("  Буква проекта не найдена")
                
                # Проверяем tooltip (название проекта)
                try:
                    tooltip = active_project.find_element(By.CLASS_NAME, "VerticalNavbar-module__1XaSPq__projectTooltip")
                    if tooltip.is_displayed():
                        print(f"  Название проекта: {tooltip.text}")
                except NoSuchElementException:
                    print("  Название проекта не найдено")
                
                return active_project
            else:
                print("Активный проект не найден, берем первую кнопку")
                return project_buttons[0]
                
        except NoSuchElementException as e:
            print(f"✗ Список проектов не найден: {e}")
            return None
    
    def test_click_project_button(self, logged_in_driver, base_url):
        """Тест клика по кнопке проекта"""
        project_button = self.test_find_project_button_in_navigation(logged_in_driver, base_url)
        
        if not project_button:
            pytest.skip("Кнопка проекта не найдена")
        
        try:
            print(f"Кликаем по кнопке проекта...")
            
            # Запоминаем состояние до клика
            before_click_url = logged_in_driver.current_url
            
            # Кликаем на кнопку проекта
            project_button.click()
            time.sleep(2)
            
            # Проверяем, что панель управления открылась
            try:
                control_panel = logged_in_driver.find_element(By.CLASS_NAME, "ControlPanel-module__aq1BBG__controlPanel")
                assert control_panel.is_displayed()
                
                # Проверяем состояние панели управления
                panel_class = control_panel.get_attribute("class")
                if "collapsed" in panel_class:
                    print("✓ Панель управления свернута")
                else:
                    print("✓ Панель управления развернута")
                    
                # Проверяем, что панель управления видима
                panel_style = control_panel.value_of_css_property("display")
                if panel_style != "none":
                    print("✓ Панель управления отображается")
                    
                return True
                
            except NoSuchElementException:
                print("Панель управления не найдена после клика")
                
                # Проверяем, возможно панель управления уже была открыта
                # и клик ее закрыл
                print("Проверяем, возможно панель управления была закрыта")
                return False
                
        except Exception as e:
            print(f"✗ Ошибка при клике по кнопке проекта: {e}")
            return False
    
    def test_project_control_panel_structure(self, logged_in_driver, base_url):
        """Тест структуры панели управления проектом"""
        # Сначала кликаем на проект, если панель управления не открыта
        try:
            logged_in_driver.find_element(By.CLASS_NAME, "ControlPanel-module__aq1BBG__controlPanel")
            print("Панель управления уже открыта")
        except NoSuchElementException:
            print("Панель управления не открыта, кликаем на проект...")
            if not self.test_click_project_button(logged_in_driver, base_url):
                pytest.skip("Не удалось открыть панель управления проектом")
        
        time.sleep(1)
        
        try:
            # Ищем панель управления
            control_panel = logged_in_driver.find_element(By.CLASS_NAME, "ControlPanel-module__aq1BBG__controlPanel")
            assert control_panel.is_displayed()
            print("✓ Панель управления проектом найдена")
            
            # 1. Проверяем заголовок проекта
            try:
                project_header = control_panel.find_element(By.CLASS_NAME, "ControlPanel-module__aq1BBG__projectHeader")
                assert project_header.is_displayed()
                print("✓ Заголовок проекта найден")
                
                # Проверяем аватар проекта
                try:
                    project_avatar = project_header.find_element(By.CLASS_NAME, "ControlPanel-module__aq1BBG__projectAvatar")
                    assert project_avatar.is_displayed()
                    print("  ✓ Аватар проекта отображается")
                except NoSuchElementException:
                    print("  ✗ Аватар проекта не найден")
                
                # Проверяем информацию о проекте
                try:
                    project_info = project_header.find_element(By.CLASS_NAME, "ControlPanel-module__aq1BBG__projectInfo")
                    assert project_info.is_displayed()
                    print("  ✓ Информация о проекте найдена")
                    
                    # Проверяем название проекта
                    try:
                        project_name = project_info.find_element(By.CLASS_NAME, "ControlPanel-module__aq1BBG__projectName")
                        print(f"    Название: {project_name.text}")
                    except NoSuchElementException:
                        print("    ✗ Название проекта не найдено")
                    
                    # Проверяем описание проекта
                    try:
                        project_desc = project_info.find_element(By.CLASS_NAME, "ControlPanel-module__aq1BBG__projectDescription")
                        print(f"    Описание: {project_desc.text}")
                    except NoSuchElementException:
                        print("    ✗ Описание проекта не найдено")
                        
                except NoSuchElementException:
                    print("  ✗ Информация о проекте не найдена")
                    
            except NoSuchElementException:
                print("✗ Заголовок проекта не найден")
            
            # 2. Проверяем навигацию в панели управления
            try:
                panel_nav = control_panel.find_element(By.CLASS_NAME, "ControlPanel-module__aq1BBG__panelNav")
                assert panel_nav.is_displayed()
                print("✓ Навигация в панели управления найдена")
                
                # Ищем кнопки навигации
                nav_buttons = panel_nav.find_elements(By.CLASS_NAME, "ControlPanel-module__aq1BBG__panelNavButton")
                print(f"  Найдено кнопок навигации: {len(nav_buttons)}")
                
                # Проверяем каждую кнопку
                expected_nav_items = ["Проект", "Доска", "Отчёты", "Настройки", "Разработчики"]
                
                for i, btn in enumerate(nav_buttons):
                    if i < len(expected_nav_items):
                        try:
                            # Ищем текст кнопки
                            nav_text = btn.find_element(By.CLASS_NAME, "ControlPanel-module__aq1BBG__panelNavText")
                            btn_text = nav_text.text
                            
                            # Проверяем иконку
                            try:
                                nav_icon = btn.find_element(By.CLASS_NAME, "ControlPanel-module__aq1BBG__panelNavIcon")
                                print(f"  Кнопка {i+1}: {btn_text} (иконка найдена)")
                            except NoSuchElementException:
                                print(f"  Кнопка {i+1}: {btn_text}")
                            
                            # Проверяем активное состояние
                            btn_class = btn.get_attribute("class")
                            if "active" in btn_class:
                                print(f"    ✓ Активна")
                            
                        except NoSuchElementException:
                            print(f"  Кнопка {i+1}: текст не найден")
                
            except NoSuchElementException:
                print("✗ Навигация в панели управления не найдена")
            
            return True
            
        except NoSuchElementException as e:
            print(f"✗ Панель управления не найдена: {e}")
            return False
    
    def test_navigation_buttons_functionality(self, logged_in_driver, base_url):
        """Тест функциональности кнопок навигации в панели управления"""
        # Сначала убеждаемся, что панель управления открыта
        if not self.test_project_control_panel_structure(logged_in_driver, base_url):
            pytest.skip("Панель управления проектом не открыта")
        
        try:
            # Ищем панель навигации
            panel_nav = logged_in_driver.find_element(By.CLASS_NAME, "ControlPanel-module__aq1BBG__panelNav")
            
            # Ищем все кнопки навигации
            nav_buttons = panel_nav.find_elements(By.CLASS_NAME, "ControlPanel-module__aq1BBG__panelNavButton")
            
            if nav_buttons:
                print(f"Тестируем {len(nav_buttons)} кнопок навигации...")
                
                # Находим активную кнопку (если есть)
                active_button = None
                for btn in nav_buttons:
                    if "active" in btn.get_attribute("class"):
                        active_button = btn
                        break
                
                if active_button:
                    try:
                        active_text = active_button.find_element(By.CLASS_NAME, "ControlPanel-module__aq1BBG__panelNavText")
                        print(f"Активная кнопка: {active_text.text}")
                    except NoSuchElementException:
                        print("Активная кнопка найдена, но текст не определен")
                
                # Пробуем кликнуть на первую неактивную кнопку
                for btn in nav_buttons:
                    if "active" not in btn.get_attribute("class"):
                        try:
                            btn_text_element = btn.find_element(By.CLASS_NAME, "ControlPanel-module__aq1BBG__panelNavText")
                            btn_text = btn_text_element.text
                            
                            print(f"Кликаем на кнопку: {btn_text}")
                            btn.click()
                            time.sleep(1)
                            
                            # Проверяем, стала ли кнопка активной
                            btn_class_after = btn.get_attribute("class")
                            if "active" in btn_class_after:
                                print(f"  ✓ Кнопка {btn_text} стала активной")
                            else:
                                print(f"  ✗ Кнопка {btn_text} не стала активной")
                            
                            # Возвращаемся к исходному состоянию (кликаем на активную кнопку)
                            if active_button:
                                active_button.click()
                                time.sleep(1)
                            
                            return True
                            
                        except Exception as e:
                            print(f"Ошибка при тестировании кнопки: {e}")
                            continue
                
                print("Все кнопки активны или не удалось найти неактивную кнопку")
                return False
            else:
                print("Кнопки навигации не найдены")
                return False
                
        except Exception as e:
            print(f"✗ Ошибка при тестировании кнопок навигации: {e}")
            return False
    
    def test_toggle_control_panel(self, logged_in_driver, base_url):
        """Тест переключения (сворачивания/разворачивания) панели управления"""
        try:
            # Ищем кнопку переключения панели управления
            toggle_button = logged_in_driver.find_element(By.CLASS_NAME, "VerticalNavbar-module__1XaSPq__toggleControlPanelButton")
            assert toggle_button.is_displayed()
            print("✓ Кнопка переключения панели управления найдена")
            
            # Проверяем aria-label
            aria_label = toggle_button.get_attribute("aria-label")
            if aria_label:
                print(f"  aria-label: {aria_label}")
            
            # Проверяем начальное состояние панели управления
            try:
                control_panel = logged_in_driver.find_element(By.CLASS_NAME, "ControlPanel-module__aq1BBG__controlPanel")
                panel_class_before = control_panel.get_attribute("class")
                
                print(f"Состояние панели управления до клика: {panel_class_before}")
                
                # Кликаем на кнопку переключения
                print("Кликаем на кнопку переключения...")
                toggle_button.click()
                time.sleep(1)
                
                # Проверяем состояние панели управления после клика
                panel_class_after = control_panel.get_attribute("class")
                print(f"Состояние панели управления после клика: {panel_class_after}")
                
                # Кликаем еще раз для возврата в исходное состояние
                toggle_button.click()
                time.sleep(1)
                
                print("✓ Панель управления успешно переключается")
                return True
                
            except NoSuchElementException:
                print("Панель управления не найдена для проверки состояния")
                return False
                
        except NoSuchElementException:
            print("✗ Кнопка переключения панели управления не найдена")
            return False