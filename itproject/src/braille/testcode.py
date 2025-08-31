import RPi.GPIO as GPIO
import time

# 최대 10개 모듈까지 지원
MAX_BRAILLE_NO = 10

class Braille:
    def __init__(self, data_pin, latch_pin, clock_pin, no):
        self.data_pin = data_pin
        self.latch_pin = latch_pin
        self.clock_pin = clock_pin
        self.braille_no = no
        self.data = [0b00000000] * MAX_BRAILLE_NO

    def begin(self):
        GPIO.setmode(GPIO.BCM)
        GPIO.setwarnings(False)
        GPIO.setup(self.data_pin, GPIO.OUT)
        GPIO.setup(self.latch_pin, GPIO.OUT)
        GPIO.setup(self.clock_pin, GPIO.OUT)

    def on(self, no, index):
        idx = self.braille_no - no
        self.data[idx] |= (1 << index)

    def off(self, no, index):
        idx = self.braille_no - no
        self.data[idx] &= ~(1 << index)

    def refresh(self):
        GPIO.output(self.latch_pin, GPIO.LOW)
        for i in range(self.braille_no):
            self.shift_out(self.data[i])
        GPIO.output(self.latch_pin, GPIO.HIGH)

    def all_off(self):
        for i in range(MAX_BRAILLE_NO):
            self.data[i] = 0

    def shift_out(self, byte_data):
        for i in range(8):  # LSBFIRST
            bit = (byte_data >> i) & 1
            GPIO.output(self.data_pin, bit)
            GPIO.output(self.clock_pin, GPIO.HIGH)
            time.sleep(0.0001)
            GPIO.output(self.clock_pin, GPIO.LOW)


# =============================
# 메인 실행부
# =============================

# 핀 번호 설정 (BCM 기준)
DATA_PIN = 17     # 아두이노 2번 핀 대응
LATCH_PIN = 27    # 아두이노 3번 핀 대응
CLOCK_PIN = 22    # 아두이노 4번 핀 대응
NO_MODULE = 3     # 점자 모듈 개수

# 인스턴스 생성 및 초기화
bra = Braille(DATA_PIN, LATCH_PIN, CLOCK_PIN, NO_MODULE)

bra.begin()
bra.all_off()
bra.refresh()

# 점자 표시 데이터 (3글자)
matrix = [
    [1, 0, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 1],
]

# 점자 점 올리기
for m in range(NO_MODULE):
    for d in range(6):
        if matrix[m][d]:
            bra.on(m, d)
bra.refresh()

# 1초간 유지
time.sleep(1)

# 점자 내리기
bra.all_off()
bra.refresh()

# 종료 시 GPIO 정리 (선택 사항)
GPIO.cleanup()
