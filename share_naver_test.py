from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from webdriver_manager.chrome import ChromeDriverManager
import pyautogui
import pyperclip
import time

options = webdriver.ChromeOptions()
options.add_argument("--disable-blink-features=AutomationControlled")
options.add_experimental_option("excludeSwitches", ["enable-automation"])

driver = webdriver.Chrome(
    service=Service(ChromeDriverManager().install()),
    options=options
)

driver.maximize_window()

# 로그인
driver.get("https://nid.naver.com/nidlogin.login")
time.sleep(2)

driver.execute_script(
    "document.getElementById('id').value=arguments[0]", "여기에_네이버아이디_환경변수로처리권장"
)
driver.execute_script(
    "document.getElementById('pw').value=arguments[0]", "여기에_네이버비번_환경변수로처리권장"
)
time.sleep(1)
driver.find_element(By.ID, "log.login").click()
print("✅ 로그인 시도!")
time.sleep(3)

# 캡챠 뜨면 직접 처리
print("👉 캡챠 떴으면 직접 풀고 로그인 완료되면 Enter 눌러 (안 떴으면 그냥 Enter)")
input()

# 글쓰기 페이지 이동
driver.get("https://blog.naver.com/mhophouse/postwrite")
time.sleep(7)

# 도움말 팝업 닫기
try:
    close_btn = driver.find_element(By.CSS_SELECTOR, ".se-help-panel-close-button")
    close_btn.click()
    print("✅ 도움말 팝업 닫기 성공!")
    time.sleep(1)
except:
    print("도움말 없음, 계속 진행!")

time.sleep(2)

# 1. 제목 입력
try:
    pyautogui.click(781, 352)
    time.sleep(1)
    pyperclip.copy("자동화 제목 테스트!")
    pyautogui.hotkey("ctrl", "v")
    print("✅ 제목 입력 성공!")
except Exception as e:
    print(f"❌ 제목 실패: {e}")

time.sleep(2)

# 2. 본문 입력
try:
    pyautogui.click(516, 483)
    time.sleep(1)
    pyperclip.copy("자동화 본문 테스트!")
    pyautogui.hotkey("ctrl", "v")
    print("✅ 본문 입력 성공!")
except Exception as e:
    print(f"❌ 본문 실패: {e}")

time.sleep(2)

# 3. 발행 팝업
try:
    publish_btn = driver.find_element(By.CSS_SELECTOR, ".publish_btn__m9KHH")
    publish_btn.click()
    print("✅ 발행 팝업 열기 성공!")
except Exception as e:
    print(f"❌ 발행 팝업 실패: {e}")

time.sleep(2)

# 4. 최종 발행
try:
    confirm_btn = driver.find_element(By.CSS_SELECTOR, ".confirm_btn__WEaBq")
    confirm_btn.click()
    print("✅ 최종 발행 성공!!")
except Exception as e:
    print(f"❌ 최종 발행 실패: {e}")

time.sleep(10)

# 5. 블로그 확인
driver.get("https://blog.naver.com/mhophouse")
time.sleep(5)
print("✅ 블로그 확인해봐!")

time.sleep(30)
driver.quit()