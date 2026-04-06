-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3307
-- Generation Time: Apr 06, 2026 at 02:18 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `minibus_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `buses`
--

CREATE TABLE `buses` (
  `id` int(11) NOT NULL,
  `plate_number` varchar(20) NOT NULL,
  `capacity` int(11) DEFAULT 30,
  `status` enum('online','offline','maintenance') DEFAULT 'online'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `buses`
--

INSERT INTO `buses` (`id`, `plate_number`, `capacity`, `status`) VALUES
(1, 'MB-01', 35, 'online'),
(2, 'MB-02', 35, 'online'),
(3, 'MB-03', 35, 'offline');

-- --------------------------------------------------------

--
-- Table structure for table `gps_logs`
--

CREATE TABLE `gps_logs` (
  `id` int(11) NOT NULL,
  `trip_id` int(11) DEFAULT NULL,
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `recorded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `gps_logs`
--

INSERT INTO `gps_logs` (`id`, `trip_id`, `latitude`, `longitude`, `recorded_at`) VALUES
(1, 1, 15.486, 120.967, '2026-04-04 09:52:06'),
(2, 1, 15.487, 120.968, '2026-04-04 09:52:06'),
(3, 2, 15.49, 120.97, '2026-04-04 09:52:06');

-- --------------------------------------------------------

--
-- Table structure for table `routes`
--

CREATE TABLE `routes` (
  `id` int(11) NOT NULL,
  `route_name` varchar(100) DEFAULT NULL,
  `start_point` varchar(100) DEFAULT NULL,
  `end_point` varchar(100) DEFAULT NULL,
  `coords_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`coords_json`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `routes`
--

INSERT INTO `routes` (`id`, `route_name`, `start_point`, `end_point`, `coords_json`) VALUES
(1, 'Cabanatuan', 'Terminal', 'City Proper', '[\r\n    [15.4890, 120.9722], \r\n    [15.4900, 120.9730], \r\n    [15.4910, 120.9740]\r\n]'),
(2, 'Cabiao', 'Terminal', 'Market', '[\r\n    [15.2500, 120.8500],\r\n    [15.2650, 120.8700],\r\n    [15.2800, 120.8900]\r\n]'),
(3, 'Gapan', 'Terminal', 'Downtown', '[\r\n    [15.3000, 120.9000],\r\n    [15.3200, 120.9200],\r\n    [15.3400, 120.9400]\r\n]');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `login_time` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `login_time`) VALUES
(1, 4, '2026-04-04 09:52:06'),
(2, 4, '2026-04-04 09:52:06'),
(3, 4, '2026-04-04 09:52:06'),
(4, 1, '2026-04-04 09:58:46'),
(5, 2, '2026-04-04 09:59:11'),
(6, 1, '2026-04-04 10:04:12'),
(7, 4, '2026-04-04 10:04:29'),
(8, 2, '2026-04-04 10:07:18'),
(9, 2, '2026-04-04 10:11:29'),
(10, 2, '2026-04-04 10:12:56'),
(11, 1, '2026-04-04 10:13:25'),
(12, 2, '2026-04-04 10:14:36'),
(13, 2, '2026-04-04 10:18:21'),
(14, 2, '2026-04-04 10:21:47'),
(15, 2, '2026-04-04 10:22:54'),
(16, 2, '2026-04-04 10:40:04'),
(17, 2, '2026-04-04 10:48:54');

-- --------------------------------------------------------

--
-- Table structure for table `trips`
--

CREATE TABLE `trips` (
  `id` int(11) NOT NULL,
  `driver_id` int(11) DEFAULT NULL,
  `conductor_id` int(11) DEFAULT NULL,
  `bus_id` int(11) DEFAULT NULL,
  `route_id` int(11) DEFAULT NULL,
  `start_time` datetime DEFAULT current_timestamp(),
  `end_time` datetime DEFAULT NULL,
  `status` enum('active','completed') DEFAULT 'active',
  `speed` int(11) DEFAULT 0,
  `occupancy` int(11) DEFAULT 0,
  `on_time` tinyint(1) DEFAULT 1,
  `duration_minutes` int(11) DEFAULT 0,
  `trip_duration` time DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `trips`
--

INSERT INTO `trips` (`id`, `driver_id`, `conductor_id`, `bus_id`, `route_id`, `start_time`, `end_time`, `status`, `speed`, `occupancy`, `on_time`, `duration_minutes`, `trip_duration`) VALUES
(1, 2, 4, 1, 1, '2026-04-04 17:52:06', NULL, 'active', 45, 28, 1, 30, NULL),
(2, 3, 4, 2, 2, '2026-04-04 17:52:06', NULL, 'active', 52, 32, 1, 28, NULL),
(3, 2, 4, 3, 3, '2026-04-04 17:52:06', NULL, 'completed', 0, 0, 0, 35, NULL),
(4, 2, NULL, NULL, NULL, '2026-04-04 18:47:22', NULL, 'active', 0, 0, 1, 0, NULL),
(5, 2, NULL, NULL, NULL, '2026-04-04 18:47:28', NULL, 'active', 0, 0, 1, 0, NULL),
(6, 2, NULL, NULL, NULL, '2026-04-04 18:48:56', NULL, 'active', 0, 0, 1, 0, NULL),
(7, 2, NULL, NULL, NULL, '2026-04-04 18:52:00', '2026-04-04 18:52:01', 'completed', 0, 0, 1, 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `trip_records`
--

CREATE TABLE `trip_records` (
  `id` int(11) NOT NULL,
  `trip_id` int(11) DEFAULT NULL,
  `students` int(11) DEFAULT 0,
  `pwd` int(11) DEFAULT 0,
  `senior` int(11) DEFAULT 0,
  `regular` int(11) DEFAULT 0,
  `total` int(11) DEFAULT NULL,
  `discount_total` int(11) DEFAULT NULL,
  `recorded_hour` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `trip_records`
--

INSERT INTO `trip_records` (`id`, `trip_id`, `students`, `pwd`, `senior`, `regular`, `total`, `discount_total`, `recorded_hour`, `created_at`) VALUES
(1, 1, 10, 2, 3, 13, 28, 15, 8, '2026-04-04 09:52:06'),
(2, 1, 5, 1, 2, 10, 18, 8, 9, '2026-04-04 09:52:06'),
(3, 2, 8, 2, 2, 20, 32, 12, 17, '2026-04-04 09:52:06'),
(4, 3, 6, 1, 1, 12, 20, 8, 14, '2026-04-04 09:52:06');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','driver','conductor') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `role`, `created_at`) VALUES
(1, 'admin', 'admin@example.com', 'admin123', 'admin', '2026-04-04 09:52:06'),
(2, 'driver1', 'driver1@example.com', 'driver123', 'driver', '2026-04-04 09:52:06'),
(3, 'driver2', 'driver2@example.com', 'driver123', 'driver', '2026-04-04 09:52:06'),
(4, 'conductor1', 'conductor1@example.com', 'conduct123', 'conductor', '2026-04-04 09:52:06');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `buses`
--
ALTER TABLE `buses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `plate_number` (`plate_number`);

--
-- Indexes for table `gps_logs`
--
ALTER TABLE `gps_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `trip_id` (`trip_id`);

--
-- Indexes for table `routes`
--
ALTER TABLE `routes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `trips`
--
ALTER TABLE `trips`
  ADD PRIMARY KEY (`id`),
  ADD KEY `driver_id` (`driver_id`),
  ADD KEY `conductor_id` (`conductor_id`),
  ADD KEY `bus_id` (`bus_id`),
  ADD KEY `route_id` (`route_id`);

--
-- Indexes for table `trip_records`
--
ALTER TABLE `trip_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `trip_id` (`trip_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `buses`
--
ALTER TABLE `buses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `gps_logs`
--
ALTER TABLE `gps_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `routes`
--
ALTER TABLE `routes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `sessions`
--
ALTER TABLE `sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `trips`
--
ALTER TABLE `trips`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `trip_records`
--
ALTER TABLE `trip_records`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `gps_logs`
--
ALTER TABLE `gps_logs`
  ADD CONSTRAINT `gps_logs_ibfk_1` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `sessions`
--
ALTER TABLE `sessions`
  ADD CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `trips`
--
ALTER TABLE `trips`
  ADD CONSTRAINT `trips_ibfk_1` FOREIGN KEY (`driver_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `trips_ibfk_2` FOREIGN KEY (`conductor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `trips_ibfk_3` FOREIGN KEY (`bus_id`) REFERENCES `buses` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `trips_ibfk_4` FOREIGN KEY (`route_id`) REFERENCES `routes` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `trip_records`
--
ALTER TABLE `trip_records`
  ADD CONSTRAINT `trip_records_ibfk_1` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
