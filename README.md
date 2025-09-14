# Logger Dashboard Project!

Logger dashboard project for home self-made IoT based on Raspberry Pico with SHT-30/40 or BME280 sensor.

## 1. Database configuration (MySQL)

DB.sql - contains tables and view queries.
DB_DATA.sql - contains basic data (types, permissions etc...).

## 2. Backend configuration

Create .env file in backend folder:
PORT_DEV=3000
IP_DEV="localhost"
DB_DEV="DB_name"
DBUSER_DEV="DB_username"
DBPASSWORD_DEV=""
DBHOST_DEV="DB_host"
FRONTEND_URL_DEV="IP:PORT"

PORT_PROD=3000
IP_PROD="IP/HOST"
DB_PROD="DB_name"
DBUSER_PROD="DB_username"
DBPASSWORD_PROD=""
DBHOST_PROD="DB_host"
FRONTEND_URL_PROD="IP:PORT"

TOKEN="token password"
TOKEN_SECRET_PERMISSION="permission token password"
GMAIL_USER='host@gmail.com'
GMAIL_PASSWORD='password'

## 3. Frontend configuration

Create .env.development file in frontend folder:
VITE_API_IP="IP:PORT"
Create .env.production file in frontend folder:
VITE_API_IP="IP:PORT"

## 4. Frontend build

For production frontend build (dist-frontend folder) must be place in backend.

## 5. MicroPython logger configuration (logger and sensor must be added to database -> ID required)

Configure WiFi settings (SSID/PASSWORD) in program.py file, set CLOCK flag if external RTC is used and SET if time must be synchronized - external RTC.
Configure other settings in main.py file (Logger/Sensor ID, select which parameter will be measured and set URL for TOKEN, DATA and ERROR).

## 6. C/C++ logger configuration (logger and sensor must be added to database -> ID required)

If device is not flashed:
Configure settings in main.hpp file (Logger/Sensor ID, select which parameter will be measured , set URL for TOKEN, DATA and ERROR, set server IP and port. Set flags for sensors - SHT or BME, RTC clocks - internal or external PCF8563T and if synchronization with NTP server is needed). Set WIFI credentials (SSID/PASSWORD).

if device is flashed:
Connect to PC via USB and configure device with use of python software.
Python software is located in logger/Tools folder - prepare python venv, activate it and install pyserial module.

## 7. API documentation

Postman application is used for API documentation.

## 8. Permissions documentation

All used permissions are documented in permissions folder.

## 9. PCB documentation

All PCBs documentation (KiCAD files) for IoT loggers (Raspberry Pico and ESP8266).
