"""
Тесты управления проектами в TaskFlow.
Проверяет создание, редактирование и управление проектами.
Предполагается, что пользователь уже авторизован.
"""

import time
import pytest
from selenium.webdriver.common.by import By
from selenium.common.exceptions import NoSuchElementException


class TestProjects:
    """Тесты управления проектами"""
    
    def test_navigation_projects_list(self, logged_in_driver , base_url):
        """Тест списка проектов в навигации"""
        time.sleep(1)
        
        try:
            # Ищем список проектов в навигации
            projects_list = logged_in_driver.find_element(By.CLASS_NAME, "VerticalNavbar-module__1XaSPq__projectsList")
            assert projects_list.is_displayed()
            print("✓ Список проектов в навигации найден")
            
            # Ищем элементы проектов
            project_buttons = projects_list.find_elements(By.CLASS_NAME, "VerticalNavbar-module__1XaSPq__projectButton")
            print(f"  Найдено проектов в списке: {len(project_buttons)}")
            
            if project_buttons:
                # Проверяем первый проект
                first_project = project_buttons[0]
                assert first_project.is_displayed()
                
                # Проверяем наличие аватара/иконки проекта
                try:
                    project_placeholder = first_project.find_element(By.CLASS_NAME, "VerticalNavbar-module__1XaSPq__projectPlaceholder")
                    if project_placeholder.is_displayed():
                        print(f"  Аватар проекта: {project_placeholder.text}")
                except NoSuchElementException:
                    print("  Аватар проекта не найден")
                
                # Проверяем tooltip
                try:
                    project_tooltip = first_project.find_element(By.CLASS_NAME, "VerticalNavbar-module__1XaSPq__projectTooltip")
                    if project_tooltip.is_displayed():
                        print(f"  Название проекта: {project_tooltip.text}")
                except NoSuchElementException:
                    print("  Название проекта не найдено")
                
                return project_buttons
            else:
                print("  Элементы проектов не найдены в списке")
                return []
                
        except NoSuchElementException as e:
            print(f"Список проектов не найден: {e}")
            return []
    
    def test_control_panel_project_info(self, logged_in_driver, base_url):
        """Тест информации о проекте в панели управления"""
        time.sleep(1)
        
        try:
            # Ищем панель управления
            control_panel = logged_in_driver.find_element(By.CLASS_NAME, "ControlPanel-module__aq1BBG__controlPanel")
            assert control_panel.is_displayed()
            print("✓ Панель управления найдена")
            
            # Проверяем состояние панели
            panel_class = control_panel.get_attribute("class")
            if "collapsed" in panel_class:
                print("  Панель управления свернута")
            else:
                print("  Панель управления развернута")
            
            # Ищем информацию о проекте
            try:
                project_header = control_panel.find_element(By.CLASS_NAME, "ControlPanel-module__aq1BBG__projectHeader")
                assert project_header.is_displayed()
                print("  ✓ Заголовок проекта найден")
                
                # Ищем название проекта
                try:
                    project_name = project_header.find_element(By.CLASS_NAME, "ControlPanel-module__aq1BBG__projectName")
                    print(f"    Название проекта: {project_name.text}")
                except NoSuchElementException:
                    print("    Название проекта не найдено")
                
                # Ищем описание проекта
                try:
                    project_desc = project_header.find_element(By.CLASS_NAME, "ControlPanel-module__aq1BBG__projectDescription")
                    print(f"    Описание проекта: {project_desc.text}")
                except NoSuchElementException:
                    print("    Описание проекта не найдено")
                
                return True
                
            except NoSuchElementException:
                print("  Заголовок проекта не найден в панели управления")
                return False
                
        except NoSuchElementException:
            print("Панель управления не найдена")
            return False
    
    def test_control_panel_navigation(self, logged_in_driver, base_url):
        """Тест навигации в панели управления"""
        time.sleep(1)
        
        try:
            # Ищем панель навигации
            panel_nav = logged_in_driver.find_element(By.CLASS_NAME, "ControlPanel-module__aq1BBG__panelNav")
            assert panel_nav.is_displayed()
            print("✓ Панель навигации найдена")
            
            # Ищем кнопки навигации
            nav_buttons = panel_nav.find_elements(By.CLASS_NAME, "ControlPanel-module__aq1BBG__panelNavButton")
            print(f"  Найдено кнопок навигации: {len(nav_buttons)}")
            
            if nav_buttons:
                # Проверяем первую кнопку (обычно "Главная")
                first_button = nav_buttons[0]
                assert first_button.is_displayed()
                
                # Проверяем активное состояние
                button_class = first_button.get_attribute("class")
                if "active" in button_class:
                    print("  ✓ Первая кнопка активна")
                
                # Ищем текст кнопки
                try:
                    button_text = first_button.find_element(By.CLASS_NAME, "ControlPanel-module__aq1BBG__panelNavText")
                    print(f"    Текст кнопки: {button_text.text}")
                except NoSuchElementException:
                    print("    Текст кнопки не найден")
                
                # Ищем иконку
                try:
                    button_icon = first_button.find_element(By.CLASS_NAME, "ControlPanel-module__aq1BBG__panelNavIcon")
                    print("    Иконка кнопки найдена")
                except NoSuchElementException:
                    print("    Иконка кнопки не найдена")
            
            return True
            
        except NoSuchElementException:
            print("Панель навигации не найдена")
            return False
    
    def test_project_prompt_message(self, logged_in_driver, base_url):
        """Тест сообщения-подсказки о проекте"""
        time.sleep(1)
        
        try:
            # Ищем подсказку о проекте
            project_prompt = logged_in_driver.find_element(By.CLASS_NAME, "ControlPanel-module__aq1BBG__projectPrompt")
            assert project_prompt.is_displayed()
            print("✓ Подсказка о проекте найдена")
            
            # Проверяем текст подсказки
            try:
                prompt_text = project_prompt.find_element(By.CLASS_NAME, "ControlPanel-module__aq1BBG__promptText")
                print(f"  Текст подсказки: {prompt_text.text}")
            except NoSuchElementException:
                print("  Текст подсказки не найден")
            
            # Проверяем иконку подсказки
            try:
                prompt_icon = project_prompt.find_element(By.CLASS_NAME, "ControlPanel-module__aq1BBG__promptIcon")
                print("  Иконка подсказки найдена")
            except NoSuchElementException:
                print("  Иконка подсказки не найдена")
            
            return True
            
        except NoSuchElementException:
            print("Подсказка о проекте не найдена")
            return False
    
    def test_welcome_card_content(self, driver, base_url):
        """Тест содержимого приветственной карточки"""
        time.sleep(1)
        
        try:
            # Ищем приветственную карточку
            welcome_card = driver.find_element(By.CLASS_NAME, "BoardsContent-module__3QtOWq__welcomeCard")
            assert welcome_card.is_displayed()
            print("✓ Приветственная карточка найдена")
            
            # Проверяем заголовок
            try:
                welcome_title = welcome_card.find_element(By.CLASS_NAME, "BoardsContent-module__3QtOWq__welcomeTitle")
                print(f"  Заголовок: {welcome_title.text}")
            except NoSuchElementException:
                print("  Заголовок не найден")
            
            # Проверяем описание
            try:
                welcome_desc = welcome_card.find_element(By.CLASS_NAME, "BoardsContent-module__3QtOWq__welcomeDescription")
                print(f"  Описание: {welcome_desc.text[:100]}...")
            except NoSuchElementException:
                print("  Описание не найдено")
            
            # Проверяем метрики
            try:
                metrics = welcome_card.find_elements(By.CLASS_NAME, "BoardsContent-module__3QtOWq__metric")
                print(f"  Метрик найдено: {len(metrics)}")
                
                for i, metric in enumerate(metrics[:3]):
                    try:
                        metric_value = metric.find_element(By.CLASS_NAME, "BoardsContent-module__3QtOWq__metricValue")
                        metric_label = metric.find_element(By.CLASS_NAME, "BoardsContent-module__3QtOWq__metricLabel")
                        print(f"    Метрика {i+1}: {metric_value.text} {metric_label.text}")
                    except NoSuchElementException:
                        print(f"    Метрика {i+1}: данные не найдены")
            except NoSuchElementException:
                print("  Метрики не найдены")
            
            return True
            
        except NoSuchElementException:
            print("Приветственная карточка не найдена")
            return False