import sys
import time
import pytest


def run_tests_headless():
    """Запуск тестов в headless режиме"""
    print("Запуск тестов для TaskFlow в headless режиме")
    print("Время начала:", time.strftime("%H:%M:%S"))
    
    test_files = [
        #("test_welcome_page.py", "Тесты главной страницы (публичные)"),
        ("test_auth_page.py", "Тесты страницы авторизации"),
        #("test_navigation.py", "Тесты навигации"),
        #("test_main_page.py", "Тесты главной страницы после авторизации"),
        #("test_dashboard.py", "Тесты дашборда"),
        #("test_tasks.py", "Тесты управления задачами"),
        #("test_control_panel.py", "Тесты панели управления"),
        #("test_profile.py", "Тесты профиля пользователя"),
        #("test_projects.py", "Тесты управления проектами"),
        #("test_project_navigation.py", "Тесты навигации по проектам"),
        #("test_profile_modal.py", "Тесты модального окна профиля")
    ]
    
    total_passed = 0
    total_failed = 0
    
    for test_file, description in test_files:
        print(f"\n{description}")
        print(f"Файл: {test_file}")
        
        exit_code = pytest.main([
            test_file,
            "--headless",
            "-v",
            "-s",
            "--tb=short"
        ])
        
        if exit_code == 0:
            print("Все тесты пройдены")
            total_passed += 1
        else:
            print(f"Тесты не пройдены (код: {exit_code})")
            total_failed += 1
        
        time.sleep(1)
    
    # Итог
    print(f"\nИТОГ:")
    print(f"Пройдено файлов: {total_passed}")
    print(f"Не пройдено файлов: {total_failed}")
    print(f"Всего файлов: {len(test_files)}")
    print(f"\nВремя окончания:", time.strftime("%H:%M:%S"))
    
    return 0 if total_failed == 0 else 1


def run_tests_with_browser():
    """Запуск тестов с отображением браузера"""
    print("Запуск тестов для TaskFlow с отображением браузера")
    print("Время начала:", time.strftime("%H:%M:%S"))
    
    test_files = [
        ("test_welcome_page.py", "Тесты главной страницы"),
        ("test_auth_page.py", "Тесты страницы авторизации"),
        ("test_navigation.py", "Тесты навигации"),
        ("test_main_page.py", "Тесты дашборда после авторизации"),
        ("test_control_panel.py", "Тесты панели управления"),
        ("test_profile.py", "Тесты профиля пользователя"),
        ("test_tasks.py", "Тесты управления задачами"),
        ("test_projects.py", "Тесты управления проектами"),
        ("test_project_navigation.py", "Тесты навигации по проектам"),
        ("test_profile_modal.py", "Тесты модального окна профиля")
    ]
    
    total_passed = 0
    total_failed = 0
    
    for test_file, description in test_files:
        print(f"\n{description}")
        print(f"Файл: {test_file}")
        
        exit_code = pytest.main([
            test_file,
            "-v",
            "-s",
            "--tb=short"
        ])
        
        if exit_code == 0:
            print("Все тесты пройдены")
            total_passed += 1
        else:
            print(f"Тесты не пройдены (код: {exit_code})")
            total_failed += 1
        
        time.sleep(1)
    
    # Итог
    print(f"\nИТОГ:")
    print(f"Пройдено файлов: {total_passed}")
    print(f"Не пройдено файлов: {total_failed}")
    print(f"Всего файлов: {len(test_files)}")
    print(f"\nВремя окончания:", time.strftime("%H:%M:%S"))
    
    return 0 if total_failed == 0 else 1


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Запуск тестов для TaskFlow')
    parser.add_argument('--headless', action='store_true', help='Запуск в headless режиме')
    
    args = parser.parse_args()
    
    if args.headless:
        exit_code = run_tests_headless()
    else:
        exit_code = run_tests_with_browser()
    
    sys.exit(exit_code)