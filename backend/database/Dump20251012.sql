-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: ticketing_system
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `chat_messages`
--

DROP TABLE IF EXISTS `chat_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ticket_id` int NOT NULL,
  `sender_id` int NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_internal` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `sender_id` (`sender_id`),
  KEY `idx_chat_ticket` (`ticket_id`),
  CONSTRAINT `chat_messages_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chat_messages_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_messages`
--

LOCK TABLES `chat_messages` WRITE;
/*!40000 ALTER TABLE `chat_messages` DISABLE KEYS */;
INSERT INTO `chat_messages` VALUES (1,1,1,'hello , please see my issue','2025-09-22 14:34:34',0),(2,2,4,'hii, please solve my issue as soon as possible ','2025-09-22 16:40:15',0),(3,1,2,'It\'s fixed','2025-09-22 16:42:20',0),(4,3,2,'hello','2025-09-23 08:47:09',0),(5,3,2,'fix my issue','2025-09-23 08:51:13',0),(6,2,3,'? ESCALATION: This ticket has exceeded its SLA deadline and requires immediate attention.','2025-09-23 16:55:00',1),(7,4,5,'Hello','2025-09-23 18:13:25',0),(8,4,5,'please fix my issue asap.\n','2025-09-23 18:13:46',0),(9,3,3,'? ESCALATION: This ticket has exceeded its SLA deadline and requires immediate attention.','2025-09-24 11:45:00',1),(10,4,3,'? ESCALATION: This ticket has exceeded its SLA deadline and requires immediate attention.','2025-09-25 08:35:00',1),(11,1,3,'? ESCALATION: This ticket has exceeded its SLA deadline and requires immediate attention. [TEST MESSAGE]','2025-09-25 09:10:25',1),(12,2,2,'Its resolved ','2025-09-25 09:20:11',1),(13,4,2,'done ✅','2025-09-25 09:35:47',1),(14,5,3,'? ESCALATION: This ticket has exceeded its SLA deadline and requires immediate attention.','2025-10-05 04:55:00',1),(15,1,1,'I tried resetting my password but still can\'t login','2025-10-05 05:12:04',0),(16,6,3,'? ESCALATION: This ticket has exceeded its SLA deadline and requires immediate attention.','2025-10-12 05:45:00',1),(17,7,8,'hello team\n','2025-10-12 05:45:25',0);
/*!40000 ALTER TABLE `chat_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `escalations`
--

DROP TABLE IF EXISTS `escalations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `escalations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ticket_id` int NOT NULL,
  `escalation_type` enum('overdue','priority_change','manual') NOT NULL,
  `escalated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `escalated_by` int DEFAULT NULL,
  `notes` text,
  PRIMARY KEY (`id`),
  KEY `ticket_id` (`ticket_id`),
  KEY `escalated_by` (`escalated_by`),
  CONSTRAINT `escalations_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `escalations_ibfk_2` FOREIGN KEY (`escalated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `escalations`
--

LOCK TABLES `escalations` WRITE;
/*!40000 ALTER TABLE `escalations` DISABLE KEYS */;
/*!40000 ALTER TABLE `escalations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sla_rules`
--

DROP TABLE IF EXISTS `sla_rules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sla_rules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `priority` enum('low','medium','high') NOT NULL,
  `resolution_hours` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `priority` (`priority`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sla_rules`
--

LOCK TABLES `sla_rules` WRITE;
/*!40000 ALTER TABLE `sla_rules` DISABLE KEYS */;
/*!40000 ALTER TABLE `sla_rules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ticket_history`
--

DROP TABLE IF EXISTS `ticket_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ticket_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ticket_id` int NOT NULL,
  `changed_by` int NOT NULL,
  `field_name` varchar(50) NOT NULL,
  `old_value` varchar(255) DEFAULT NULL,
  `new_value` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ticket_id` (`ticket_id`),
  KEY `changed_by` (`changed_by`),
  CONSTRAINT `ticket_history_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ticket_history_ibfk_2` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ticket_history`
--

LOCK TABLES `ticket_history` WRITE;
/*!40000 ALTER TABLE `ticket_history` DISABLE KEYS */;
INSERT INTO `ticket_history` VALUES (1,1,3,'assigned_agent_id',NULL,'2','2025-09-22 15:18:49'),(2,1,3,'status',NULL,'in_progress','2025-09-22 15:18:49'),(3,1,2,'status',NULL,'resolved','2025-09-22 16:42:09'),(4,3,3,'assigned_agent_id',NULL,'2','2025-09-23 07:10:43'),(5,3,3,'status',NULL,'in_progress','2025-09-23 07:10:43'),(6,2,1,'escalated',NULL,'overdue','2025-09-23 16:55:00'),(7,2,3,'assigned_agent_id',NULL,'2','2025-09-23 19:15:22'),(8,2,3,'status',NULL,'in_progress','2025-09-23 19:15:22'),(9,3,1,'escalated',NULL,'overdue','2025-09-24 11:45:00'),(10,4,1,'escalated',NULL,'overdue','2025-09-25 08:35:00'),(11,2,2,'status',NULL,'resolved','2025-09-25 08:57:32'),(12,3,2,'status',NULL,'resolved','2025-09-25 08:57:57'),(13,4,3,'assigned_agent_id',NULL,'2','2025-09-25 09:22:00'),(14,4,3,'status',NULL,'in_progress','2025-09-25 09:22:00'),(15,5,3,'assigned_agent_id',NULL,'2','2025-09-25 09:22:13'),(16,5,3,'status',NULL,'in_progress','2025-09-25 09:22:13'),(17,4,2,'status',NULL,'resolved','2025-09-25 09:35:23'),(18,5,3,'escalated',NULL,'overdue','2025-10-05 04:55:00'),(19,1,1,'status',NULL,'resolved','2025-10-05 05:12:21'),(20,6,3,'escalated',NULL,'overdue','2025-10-12 05:45:00');
/*!40000 ALTER TABLE `ticket_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tickets`
--

DROP TABLE IF EXISTS `tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tickets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `customer_id` int NOT NULL,
  `assigned_agent_id` int DEFAULT NULL,
  `priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
  `status` enum('open','in_progress','on_hold','resolved','closed') NOT NULL DEFAULT 'open',
  `category` varchar(100) DEFAULT NULL,
  `sla_deadline` datetime NOT NULL,
  `resolved_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_overdue` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_tickets_customer` (`customer_id`),
  KEY `idx_tickets_agent` (`assigned_agent_id`),
  KEY `idx_tickets_status` (`status`),
  KEY `idx_tickets_priority` (`priority`),
  KEY `idx_tickets_sla` (`sla_deadline`),
  CONSTRAINT `tickets_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`),
  CONSTRAINT `tickets_ibfk_2` FOREIGN KEY (`assigned_agent_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tickets`
--

LOCK TABLES `tickets` WRITE;
/*!40000 ALTER TABLE `tickets` DISABLE KEYS */;
INSERT INTO `tickets` VALUES (1,'Account Login issue','Unable to find my account',1,2,'medium','resolved','technical','2025-09-23 20:04:15','2025-10-05 10:42:22','2025-09-22 14:34:14','2025-10-05 05:12:21',0),(2,'Documentation issue','i can not be able to scan docs',4,2,'medium','resolved','technical','2025-09-23 22:09:45','2025-09-25 14:27:33','2025-09-22 16:39:44','2025-09-25 08:57:32',1),(3,'Password Issue','My password showing incorrect, Solve the issue',1,2,'low','resolved','technical','2025-09-24 12:39:22','2025-09-25 14:27:57','2025-09-23 07:09:21','2025-09-25 08:57:57',1),(4,'Unable to reset password','I tried resetting my password using the ‘Forgot Password’ option but I am not receiving any reset link in my email. Please help me regain access.',5,2,'high','resolved','Login issue','2025-09-24 23:36:10','2025-09-25 15:05:23','2025-09-23 18:06:09','2025-09-25 09:35:22',1),(5,'reset password issue','i am unable to reset my password',6,2,'high','in_progress','technical','2025-09-25 17:24:32',NULL,'2025-09-24 11:54:32','2025-10-05 04:55:00',1),(6,'Login Issue','Unable to login to my account',1,NULL,'high','open','technical','2025-10-06 10:40:47',NULL,'2025-10-05 05:10:46','2025-10-12 05:45:00',1),(7,'unable to reset my password','i can not be able to reset my password',8,NULL,'medium','open','technical','2025-10-13 11:14:39',NULL,'2025-10-12 05:44:38','2025-10-12 05:44:38',0);
/*!40000 ALTER TABLE `tickets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `role` enum('customer','agent','admin') NOT NULL DEFAULT 'customer',
  `phone` varchar(20) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_users_email` (`email`),
  KEY `idx_users_role` (`role`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'khushi@gmail.com','$2a$10$4Ega1Ul60vyTn4vCmxW0Kej8ywSvDknfrgs2CvRyhNjoRuq4fcwIC','khushi','verma','customer','9302306764',1,'2025-09-22 14:33:33','2025-09-22 14:33:33'),(2,'agent@test.com','$2a$10$rRqsAhJXWiKod6OBPvcIE.Rz.bRYtCgKc7b3xXnASPYSwJlSglcr.','Agent','user','agent','1234567890',1,'2025-09-22 15:15:30','2025-09-22 15:15:30'),(3,'admin@test.com','$2a$10$mbumzM8YgNC8/zsWEOqRAuJfUZElOaegLnkY3tZemdy4n1pTNpHDi','Admin','User','admin','5556667770',1,'2025-09-22 15:17:05','2025-09-22 15:17:05'),(4,'akash@test.com','$2a$10$iQtG1h/NLxpLJwwj2lWsFu8pqC.l50K9blK/XlWwSLz.tiqd.n076','Akash','Bj','customer','11122233345',1,'2025-09-22 16:26:16','2025-09-22 16:26:16'),(5,'customer@test.com','$2a$10$ZQhETD9DNQEXzUFvtFPrK.IJ2OwRQO1X1n4S6hL.g.I5VjYPIrO0C','customer','user','customer','1234567899',1,'2025-09-23 17:35:39','2025-09-23 17:35:39'),(6,'test@example.com','$2a$10$s9w0zp5g9nLbpZGIRyU7quryBAclPK4yps9Rk2AlrpFNVBZfcw6aS','test','user','customer','1234567898',1,'2025-09-24 11:50:11','2025-09-24 11:50:11'),(7,'riya@gmail.com','$2a$10$r2TaXRwL.I602MLHPwbmBOS4diJ1sBtLy2XdhqiVfgRyW4925JKI2','riya','bhati','customer','1234567898',1,'2025-10-05 05:00:59','2025-10-05 05:00:59'),(8,'khushiv@gmail.com','$2a$10$R1rP9A0iXhm9v.5utlL2vul0ULGs.zUNrfo7/lEQyrBJzAkQGnW56','khushi','verma','customer','1234567898',1,'2025-10-12 05:43:14','2025-10-12 05:43:14'),(9,'admin12@gmail.com','$2a$10$G3VomLtanV8Ga6PRja3vGO/5UEu.5MJudS.IN0Gg6xSyGDkZKnnnG','admin','user','admin','1234567898',1,'2025-10-12 05:43:54','2025-10-12 05:43:54');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-12 11:33:18
