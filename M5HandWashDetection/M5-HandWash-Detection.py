from m5stack import *
from m5ui import *
import wifiCfg
import urequests as requests
import json
import imu
import time

# Initialize views
# Screen 0: clock
dateLbl = M5TextBox(5, 30, "", lcd.FONT_DejaVu24, 0xFFFFFF, rotate=0)
timeLbl = M5TextBox(5, 100, "", lcd.FONT_DejaVu24, 0xFFFFFF, rotate=0)

# Screen 1: labels for professionals
labels_professionals = [
    M5TextBox(30, 30, "Doctor", lcd.FONT_DejaVu24, 0xFFFFFF, rotate=0),
    M5TextBox(30, 80, "Nurse", lcd.FONT_Default, 0xFFFFFF, rotate=0),
    M5TextBox(30, 130, "Surgeon", lcd.FONT_Default, 0xFFFFFF, rotate=0)
]

# Screen 2: labels for names
labels_names = [
    M5TextBox(30, 80, "", lcd.FONT_DejaVu24, 0xFFFFFF, rotate=0),
    M5TextBox(30, 130, "", lcd.FONT_Default, 0xFFFFFF, rotate=0),
    M5TextBox(30, 180, "", lcd.FONT_Default, 0xFFFFFF, rotate=0)
]

selected_label_display = M5TextBox(30, 30, "", lcd.FONT_DejaVu24, 0xFFFFFF, rotate=0)

# Screen 3: hand wash tracker title and count
label_hwt_title = M5TextBox(40, 30, "WHT", lcd.FONT_DejaVu24, 0xFFFFFF, rotate=0)
label_hwt_count = M5TextBox(60, 100, "0", lcd.FONT_DejaVu24, 0xFFFFFF, rotate=0)
label_handwash_lbl = M5TextBox(20, 140, "counter", lcd.FONT_DejaVu24, 0xFFFFFF, rotate=0)
label_handwash_timer = M5TextBox(50, 180, "00", lcd.FONT_DejaVu24, 0xFFFFFF, rotate=0)
success = 0.0
checkAll = False
# segmentation check for detection
detectS1 = False
detectS2 = False
detectS3 = False
detectS4 = False
detectS5 = False

# Global views
line = M5Line(M5Line.PLINE, 0, 70, 135, 70, 0xFFFFFF)
forwardDedected = False
# Initialize variables
current_label_professional = 0
current_label_names = 0
professions = ["Doctor", "Nurse", "Surgeon"]
doctor_names = ""
current_screen = 0
user_uid = ""
gyro_data_size = 10.5  # Reduced data points to store for quicker detection


# IMU settings
imu0 = imu.IMU()
circle_threshold = 2000
data_size = 10.5

# Firebase URLs
firebase_url_professional = [
    "https://test-450b4-default-rtdb.firebaseio.com/Doctor.json",
    "https://test-450b4-default-rtdb.firebaseio.com/Nurse.json",
    "https://test-450b4-default-rtdb.firebaseio.com/Surgeon.json"
]
firebase_url_hand_wash_times = ""

# Hand wash counter
hand_wash_counter = 0

def main():
    connect_to_wifi()
    screen0()

def connect_to_wifi():
    wifi_ssid = 'Atuda-2.4'
    wifi_password = '22222222'
    wifiCfg.doConnect(wifi_ssid, wifi_password)
    while not wifiCfg.wlan_sta.isconnected():
        pass

def screen0():
    yellow = 0xebba34
    setScreenColor(yellow)

    while current_screen == 0:
        # Get current time as seconds since epoch
        current_time_seconds = time.time()

        # Convert seconds since epoch to local time
        local_time_struct = time.localtime(current_time_seconds)

        # Extract individual components of the date and time
        month = local_time_struct[1]
        day = local_time_struct[2]

        # Format date string
        current_date = "{:02d}-{:02d}".format(month, day)

        # Update dateLbl with current date
        dateLbl.setText(current_date)
        dateLbl.show()

        # Extract individual components of the time
        hour = local_time_struct[3]
        minute = local_time_struct[4]
        second = local_time_struct[5]

        # Format time string
        current_time = "{:02d}:{:02d}:{:02d}".format(hour, minute, second)

        # Update timeLbl with current time
        timeLbl.setText(current_time)
        timeLbl.show()

        # Delay for 1 second to update the clock
        time.sleep(1)

def screen1():
  hide_screen0()
  # display on screen the professiton labels; set the choosen one bigger
  for i, label in enumerate(labels_professionals):
    label.setFont(lcd.FONT_DejaVu24 if i == current_label_professional else lcd.FONT_Default)
    label.show()
          
def screen2():   
  global doctor_names 
  hide_screen1()

  selected_label_display.setText(professions[current_label_professional]) 

  doctor_names = get_doctor_names(firebase_url_professional[current_label_professional])
  
  selected_label_display.show()
  line.show()
  
  # Display the first three doctor names on the screen
  for i, label in enumerate(labels_names):
    if i < len(doctor_names):
      label.setText(doctor_names[i])
      label.show()
    else:
      label.hide()  # Hide the label if there are fewer names

def screen3():
    hide_screen2()

    label_hwt_title.show()
    line.show()
    label_hwt_count.show()
    label_handwash_timer.show()
    label_handwash_lbl.show()

# Function to hide all labels of Screen 0
def hide_screen0():
    timeLbl.hide()
    dateLbl.hide()

# Function to hide all labels of Screen 1
def hide_screen1():
  for label in labels_professionals:
    label.hide()

# Function to hide all labels of Screen 0
def hide_screen0():
    timeLbl.hide()
    dateLbl.hide()

# Function to hide all labels of Screen 2
def hide_screen2():
  selected_label_display.hide()
  line.hide()

  for label in labels_names:
    label.hide()

# Function to hide all labels of Screen 3
def hide_screen3():
    label_hwt_title.hide()
    line.hide()
    label_hwt_count.hide()
    label_handwash_timer.hide()
    label_handwash_lbl.hide()

# Function for button A press
def buttonA_wasPressed():
    global current_screen, current_label_professional, label_hwt_count, forwardDedected, gyro_data, accel_data, success, detectS1, detectS2, detectS3, detectS4, detectS5, checkAll
    print("buttonA_wasPressed")
    if current_screen == 0:
       # Redirect to Screen 1
        current_screen = 1
        screen1()
    elif current_screen == 1:
        labels_professionals[current_label_professional].setFont(lcd.FONT_Default)  # Reset font for the current label

        # Redirect to Screen 2
        current_screen = 2
        gyro_data = []  # Clear the gyro data list
        accel_data = []  # Clear the accel data list
        screen2()

    elif current_screen == 2:
        # Redirect to Screen 3
        current_screen = 3
        screen3()
        label_hwt_count.setText(str(hand_wash_counter))

    elif current_screen == 3:
        gyro_data = []  # Clear the gyro data list
        accel_data = []  # Clear the accel data list
        start_time = time.time()
        duration = 20  # Set the desired duration in seconds
        elips_duration = 67 # set timer const variable
        timer_time = 0 
        success = 0.0 # Set success to 0.0
        detectS1 = False
        detectS2 = False
        detectS3 = False
        detectS4 = False
        detectS5 = False
        end_time = start_time + duration
        duration_counter = end_time - start_time
        while time.time() <= end_time:
            gyro_z = imu0.gyro[2]  # Read gyro Z-axis data
            accel_x = imu0.acceleration[0]  # Read accelerometer X-axis data
            
            timer_time = (int(duration_counter/elips_duration) + (duration))
            # catch unexpected problems with cpu timer libarry in M5
            if timer_time <= 0:
                timer_time = 0
                
            label_handwash_timer.setText(str(timer_time))

            if len(gyro_data) >= data_size:
                gyro_data.pop(0)
            if len(accel_data) >= data_size:
                accel_data.pop(0)

            gyro_data.append(gyro_z)
            accel_data.append(accel_x)
            duration_counter -= 1
            # Detect forward movement
            # segment 1
            if (timer_time > 17 and timer_time <= 20) and detectS1 == False:
                detect_Wash(1)
                if detectS1:
                    success += 0.1
                    print("segment 1 success")

            # segment 2
            if (timer_time > 13  and timer_time <= 16) and detectS2 == False:
                detect_Wash(2)
                if detectS2:
                    success += 0.1
                    print("segment 2 success")

            # segment 3
            if (timer_time > 9  and timer_time <= 12) and detectS3 == False:
                detect_Wash(3)
                if detectS3:
                    success += 0.1
                    print("segment 3 success")

            # segment 4
            if (timer_time > 5  and timer_time <= 8) and detectS4 == False:
                detect_Wash(4)
                if detectS4:
                    success += 0.1
                    print("segment 4 success")

            # segment 5
            if (timer_time > 0  and timer_time <= 4) and detectS5 == False:
                detect_Wash(5)
                if detectS5:
                    success += 0.1
                    print("segment 5 success")
                checkAll = True

        # in the end of the timer send result to firebase    
        if timer_time == 0 and checkAll:
            update_hand_wash_times(success)

    label_handwash_timer.setText("00")
    
# Function for button B press
def buttonB_wasPressed():
  global current_label_professional, current_label_names, doctor_names

  if current_screen == 1:
    labels_professionals[current_label_professional].setFont(lcd.FONT_Default)  # Reset font for the current label

    # Circular move to the next label
    current_label_professional = (current_label_professional + 1) % len(labels_professionals)
    labels_professionals[current_label_professional].setFont(lcd.FONT_DejaVu24)
  
  if current_screen == 2:
    # Circular move to the next label in labels_names
    current_label_names = (current_label_names + 1) % len(doctor_names)

    # Display the updated names on the screen
    if len(doctor_names) > 1:
        for i, label in enumerate(labels_names):
            label_index = (current_label_names + i) % len(doctor_names)
            if  len(doctor_names) == 2 and i == 2:
                return
            label.setText(doctor_names[label_index])
            label.show()

# Function for double press on button B
def buttonB_wasDoublePress():
    global current_screen, current_label_professional
    # Return to Screen 1
    if current_screen == 2:
        current_screen = 1
        hide_screen2()
        screen1()
       
def detect_Wash(segment_number):
    global gyro_z_sum, forwardDedected, detectS1, detectS2, detectS3, detectS4, detectS5
    gyro_z_sum=0
    if len(gyro_data) >= gyro_data_size:
        gyro_z_sum = sum([abs(g) for g in gyro_data])
        if gyro_z_sum > circle_threshold:
            gyro_z_sum = 0
            print("Circle detected")
            if segment_number == 1:
                detectS1 = True
            elif segment_number == 2:
                detectS2 = True
            elif segment_number == 3:
                detectS3 = True
            elif segment_number == 4:
                detectS4 = True
            elif segment_number == 5:
                detectS5 = True

# Function to get all names from the "Doctor" branch
def get_doctor_names(firebase_url):
  global user_uid, firebase_url_hand_wash_times

  try:
      response = requests.get(firebase_url)
      if response.status_code == 200:
          data = json.loads(response.text)
          user_uid = list(data.keys())
          doctor_names = list(data.values())
          response.close()
          return doctor_names
      response.close()  # Release resources
  except Exception as e:
      print("Failed to fetch doctor names: {}".format(e))
  return []

def update_hand_wash_times(successPresent):
    global user_uid, hand_wash_counter, label_hwt_count

    try:
        hand_wash_counter += (1 + successPresent)
        print(hand_wash_counter)
        user_uid_value = user_uid[current_label_names]
        firebase_url_hand_wash_times = "https://test-450b4-default-rtdb.firebaseio.com/users/{}.json".format(user_uid_value)

        # Fetch existing user data
        response = requests.get(firebase_url_hand_wash_times)
        if response.status_code == 200:
            user_data = json.loads(response.text)
            response.close()

            # Update handWashTimes field
            user_data["handWashTimes"] = hand_wash_counter

            # Send updated data back to Firebase
            response = requests.put(
                firebase_url_hand_wash_times,
                data=json.dumps(user_data),
                headers={"Content-Type": "application/json"}
            )

            if response.status_code != 200:
                print("Failed to update:", response.status_code)
            response.close()  # Release resources
        # clear success present
        hand_wash_counter = int(hand_wash_counter)
        print(hand_wash_counter)
    except Exception as e:
        print("Request failed:", e)

    label_hwt_count.setText(str(hand_wash_counter))

# Main:
btnA.wasPressed(buttonA_wasPressed)
btnB.wasPressed(buttonB_wasPressed)
btnB.wasDoublePress(buttonB_wasDoublePress)
main()