-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               9.1.0 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.10.0.7000
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Dumping data for table logger_wsb_dev.adm_access_level_definition: ~5 rows (approximately)
INSERT INTO `adm_access_level_definition` (`id`, `name`, `access_level`) VALUES
	(1, 'NONE', 0),
	(2, 'READ', 10),
	(3, 'WRITE', 20),
	(4, 'DELETE', 30),
	(5, 'ADMIN', 50);

-- Dumping data for table logger_wsb_dev.adm_functionality_definition: ~6 rows (approximately)
INSERT INTO `adm_functionality_definition` (`id`, `name`, `description`) VALUES
	(1, 'equ', 'equipment module functionality.'),
	(2, 'house', 'house module functionality.'),
	(3, 'data', 'data module functionality.'),
	(4, 'adm', 'admin module functionality.'),
	(6, 'common', 'common module functionality.'),
	(7, 'process', 'process module functionality.');

-- Dumping data for table logger_wsb_dev.adm_object_definition: ~22 rows (approximately)
INSERT INTO `adm_object_definition` (`id`, `name`, `description`) VALUES
	(1, 'equType', 'equipment type object.'),
	(2, 'equVendor', 'equipment vendor object.'),
	(3, 'equModel', 'equipment model object.'),
	(4, 'equEquipment', 'equipment object.'),
	(5, 'houseLogger', 'house logger object.'),
	(6, 'houseRoom', 'house room object.'),
	(7, 'houseSensor', 'house sensor object.'),
	(8, 'houseSensorFunctions', 'house sensor functions object.'),
	(9, 'dataDefinition', 'data definition object.'),
	(10, 'dataLog', 'data log object.'),
	(11, 'admFunctionalityDefinition', 'admin functionality definition object.'),
	(12, 'admObjectDefinition', 'admin object definition object.'),
	(13, 'admAccessLevelDefinition', 'admin access level definition object.'),
	(14, 'admRole', 'admin role object.'),
	(15, 'admRoleUser', 'admin role user object.'),
	(16, 'admPermission', 'admin permission object.'),
	(18, 'houseHouse', 'house house object.'),
	(19, 'houseFloor', 'house floor object.'),
	(20, 'common', 'common object.'),
	(21, 'processType', 'process type object.'),
	(22, 'processDefinition', 'process definition object.'),
	(28, 'admUsers', 'admin users object.');

-- Dumping data for table logger_wsb_dev.data_definitions: ~4 rows (approximately)
INSERT INTO `data_definitions` (`id`, `name`, `unit`, `description`, `created_at`, `updated_at`) VALUES
	(1, 'temperature', '°C', 'Sensor temperature measurement', '2025-03-03 19:14:32', '2025-05-04 19:50:56'),
	(2, 'humidity', '%rH', 'Sensor humidity measurement', '2025-03-03 19:14:32', '2025-05-04 19:50:56'),
	(3, 'atmPressure', 'HPa', 'Sensor pressure measurement', '2025-03-03 19:14:32', '2025-05-04 19:50:56'),
	(6, 'altitude', 'm', 'Sensor altitude measurement', '2025-05-04 19:50:56', '2025-05-04 19:50:56');

-- Dumping data for table logger_wsb_dev.equ_model: ~3 rows (approximately)
INSERT INTO `equ_model` (`id`, `name`) VALUES
	(2, 'Pico'),
	(3, 'ESP8266'),
	(4, 'SHT-41');

-- Dumping data for table logger_wsb_dev.equ_sensor_functions: ~3 rows (approximately)
INSERT INTO `equ_sensor_functions` (`equ_sensor_id`, `data_definition_id`) VALUES
	(816, 1),
	(356, 2),
	(816, 2);

-- Dumping data for table logger_wsb_dev.equ_type: ~2 rows (approximately)
INSERT INTO `equ_type` (`id`, `name`) VALUES
	(1, 'Logger'),
	(2, 'Sensor');

-- Dumping data for table logger_wsb_dev.equ_vendor: ~3 rows (approximately)
INSERT INTO `equ_vendor` (`id`, `name`) VALUES
	(2, 'Raspberry'),
	(3, 'NodemCU'),
	(4, 'Sensirion');

-- Dumping data for table logger_wsb_dev.process_type: ~2 rows (approximately)
INSERT INTO `process_type` (`id`, `name`) VALUES
	(2, 'Calibration'),
	(3, 'Maintenance');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
