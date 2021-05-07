-- phpMyAdmin SQL Dump
-- version 5.0.2
-- https://www.phpmyadmin.net/
--
-- Φιλοξενητής: 127.0.0.1
-- Χρόνος δημιουργίας: 07 Μάη 2021 στις 22:01:04
-- Έκδοση διακομιστή: 10.4.14-MariaDB
-- Έκδοση PHP: 7.2.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Βάση δεδομένων: `marketplacebot`
--

-- --------------------------------------------------------

--
-- Δομή πίνακα για τον πίνακα `channels`
--

CREATE TABLE `channels` (
  `id` int(11) NOT NULL,
  `guildID` varchar(18) COLLATE utf8mb4_bin NOT NULL,
  `channelID` varchar(18) COLLATE utf8mb4_bin DEFAULT NULL,
  `createdBy` varchar(18) COLLATE utf8mb4_bin NOT NULL,
  `masterUser` varchar(18) COLLATE utf8mb4_bin NOT NULL,
  `tagsPerDay` tinyint(3) NOT NULL DEFAULT 1,
  `createdOn` datetime NOT NULL DEFAULT current_timestamp(),
  `startsOn` datetime NOT NULL,
  `expiresOn` datetime NOT NULL,
  `isClosed` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

--
-- Άδειασμα δεδομένων του πίνακα `channels`
--

INSERT INTO `channels` (`id`, `guildID`, `channelID`, `createdBy`, `masterUser`, `tagsPerDay`, `createdOn`, `startsOn`, `expiresOn`, `isClosed`) VALUES
(1, '840173865467641877', '840194125009387520', '839768031805702154', '839768031805702154', 1, '2021-05-07 11:51:29', '2021-05-07 11:51:29', '2021-05-07 11:52:29', 1),
(2, '840173865467641877', '840217747722993694', 'Webhook', '839768031805702154', 1, '2021-05-07 13:25:21', '2021-05-07 13:25:21', '2021-05-07 13:26:21', 1),
(3, '840173865467641877', '840218499732471828', 'Webhook', '839768031805702154', 1, '2021-05-07 13:28:20', '2021-05-07 13:28:20', '2021-05-07 13:29:20', 1),
(4, '840173865467641877', '840218873243369533', 'Webhook', '839768031805702154', 1, '2021-05-07 13:29:49', '2021-05-07 13:29:49', '2021-05-07 13:30:49', 1),
(5, '840173865467641877', '840219356831023115', 'Webhook', '839768031805702154', 1, '2021-05-07 13:31:44', '2021-05-07 13:31:44', '2021-05-07 13:32:44', 1),
(6, '840173865467641877', '840220010495344660', 'Webhook', '839768031805702154', 1, '2021-05-07 13:34:20', '2021-05-07 13:34:20', '2021-05-07 13:35:20', 1);

-- --------------------------------------------------------

--
-- Δομή πίνακα για τον πίνακα `mods`
--

CREATE TABLE `mods` (
  `id` int(11) NOT NULL,
  `channelID` varchar(18) COLLATE utf8mb4_bin NOT NULL,
  `modID` varchar(18) COLLATE utf8mb4_bin NOT NULL,
  `addedBy` varchar(18) COLLATE utf8mb4_bin NOT NULL,
  `addedOn` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

--
-- Άδειασμα δεδομένων του πίνακα `mods`
--

INSERT INTO `mods` (`id`, `channelID`, `modID`, `addedBy`, `addedOn`) VALUES
(1, '830070336434339880', '241897454507655168', '191478373975982082', '2021-04-09 13:23:34'),
(2, '830070336434339880', '830004672197689396', '191478373975982082', '2021-04-09 13:23:34'),
(3, '830070336434339880', '828233004383338498', '191478373975982082', '2021-04-09 13:23:34'),
(4, '830070565821087776', '241897454507655168', '191478373975982082', '2021-04-09 13:24:10'),
(5, '830070565821087776', '830004672197689396', '191478373975982082', '2021-04-09 13:24:10'),
(6, '830070565821087776', '828233004383338498', '191478373975982082', '2021-04-09 13:24:10'),
(7, '830071872670269541', '191478373975982082', '830004672197689396', '2021-04-09 13:29:22'),
(8, '830072098865152030', '191478373975982082', '830004672197689396', '2021-04-09 13:30:20'),
(9, '836676373782986832', '191478373975982082', '831480672626933770', '2021-04-27 18:54:26');

-- --------------------------------------------------------

--
-- Δομή πίνακα για τον πίνακα `sentpings`
--

CREATE TABLE `sentpings` (
  `id` int(11) NOT NULL,
  `channelID` varchar(18) COLLATE utf8mb4_bin NOT NULL,
  `sentOn` datetime NOT NULL DEFAULT current_timestamp(),
  `sentBy` varchar(18) COLLATE utf8mb4_bin NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

--
-- Άδειασμα δεδομένων του πίνακα `sentpings`
--

INSERT INTO `sentpings` (`id`, `channelID`, `sentOn`, `sentBy`) VALUES
(1, '829856034080292914', '2021-04-07 23:20:02', '191478373975982082'),
(2, '829856034080292914', '2021-04-08 23:20:07', '191478373975982082'),
(3, '830068514722676766', '2021-04-09 13:16:48', '241897454507655168'),
(4, '830069286445514753', '2021-04-09 13:19:48', '241897454507655168'),
(5, '836675375886761995', '2021-04-27 18:50:20', '831480672626933770');

-- --------------------------------------------------------

--
-- Δομή πίνακα για τον πίνακα `settings`
--

CREATE TABLE `settings` (
  `guildID` varchar(18) COLLATE utf8mb4_bin NOT NULL,
  `openCategoryID` varchar(18) COLLATE utf8mb4_bin NOT NULL,
  `closedCategoryID` varchar(18) COLLATE utf8mb4_bin NOT NULL,
  `publicBotChannel` varchar(18) COLLATE utf8mb4_bin NOT NULL,
  `privateBotChannel` varchar(18) COLLATE utf8mb4_bin NOT NULL,
  `owner` varchar(18) COLLATE utf8mb4_bin NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `pricePerDay` decimal(15,2) NOT NULL,
  `minimumDays` smallint(6) NOT NULL,
  `sellixAPIKey` varchar(64) COLLATE utf8mb4_bin NOT NULL,
  `sellixSecret` varchar(255) COLLATE utf8mb4_bin NOT NULL,
  `botImg` varchar(255) COLLATE utf8mb4_bin NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

--
-- Άδειασμα δεδομένων του πίνακα `settings`
--

INSERT INTO `settings` (`guildID`, `openCategoryID`, `closedCategoryID`, `publicBotChannel`, `privateBotChannel`, `owner`, `isActive`, `pricePerDay`, `minimumDays`, `sellixAPIKey`, `sellixSecret`, `botImg`) VALUES
('469140702975098900', '469140702975098900', '829813376015925308', '469140702975098902', '761872155327070259', '191478373975982082', 0, '0.00', 0, '', '', 'https://discordjs.guide/favicon.png'),
('830004874548740116', '830045438416912384', '830045439424069662', '830004874548740119', '830007003384381440', '830004672197689396', 0, '0.50', 10, 'Bg8FMtrjGOyL9Pdr1FY84pC0xPp1acUtcWgASqcmsd7Oub7oBc4eY7fccE4wpMrx', '3pHyz1Ux8S9Iiy5BBMJNsBJtmnLHezgk', 'gay'),
('840173865467641877', '840191490965504000', '840191495268597772', '840173865929277442', '840190808896045107', '839768031805702154', 1, '10.00', 10, 'Bg8FMtrjGOyL9Pdr1FY84pC0xPp1acUtcWgASqcmsd7Oub7oBc4eY7fccE4wpMrx', '3pHyz1Ux8S9Iiy5BBMJNsBJtmnLHezgk', 'gay');

--
-- Ευρετήρια για άχρηστους πίνακες
--

--
-- Ευρετήρια για πίνακα `channels`
--
ALTER TABLE `channels`
  ADD PRIMARY KEY (`id`);

--
-- Ευρετήρια για πίνακα `mods`
--
ALTER TABLE `mods`
  ADD PRIMARY KEY (`id`);

--
-- Ευρετήρια για πίνακα `sentpings`
--
ALTER TABLE `sentpings`
  ADD PRIMARY KEY (`id`);

--
-- Ευρετήρια για πίνακα `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`guildID`);

--
-- AUTO_INCREMENT για άχρηστους πίνακες
--

--
-- AUTO_INCREMENT για πίνακα `channels`
--
ALTER TABLE `channels`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT για πίνακα `mods`
--
ALTER TABLE `mods`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT για πίνακα `sentpings`
--
ALTER TABLE `sentpings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
