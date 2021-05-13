-- phpMyAdmin SQL Dump
-- version 4.9.5deb2
-- https://www.phpmyadmin.net/
--
-- Φιλοξενητής: localhost:3306
-- Χρόνος δημιουργίας: 13 Μάη 2021 στις 10:34:56
-- Έκδοση διακομιστή: 8.0.23-0ubuntu0.20.04.1
-- Έκδοση PHP: 7.4.3

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Βάση δεδομένων: `MarketplaceBot`
--

-- --------------------------------------------------------

--
-- Δομή πίνακα για τον πίνακα `categories`
--

CREATE TABLE `categories` (
  `id` int NOT NULL,
  `guildID` varchar(18) NOT NULL,
  `CategoryID` varchar(18) NOT NULL,
  `BasePingsPerDay` smallint NOT NULL,
  `pingAddonPrice` decimal(15,2) NOT NULL,
  `pricePerDay` decimal(15,2) NOT NULL,
  `minimumDays` smallint NOT NULL,
  `maximumAmountOfChannels` smallint NOT NULL,
  `pingAddonPurchasesAvailable` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Άδειασμα δεδομένων του πίνακα `categories`
--

INSERT INTO `categories` (`id`, `guildID`, `CategoryID`, `BasePingsPerDay`, `pingAddonPrice`, `pricePerDay`, `minimumDays`, `maximumAmountOfChannels`, `pingAddonPurchasesAvailable`) VALUES
(1, '840173865467641877', '841038133335293952', 2, '3.00', '2.00', 3, 4, 1),
(2, '840173865467641877', '841041376564084807', 1, '0.00', '2.00', 3, 4, 1),
(3, '840173865467641877', '841041694769938514', 1, '0.00', '2.00', 3, 4, 1);

-- --------------------------------------------------------

--
-- Δομή πίνακα για τον πίνακα `channels`
--

CREATE TABLE `channels` (
  `id` int NOT NULL,
  `guildID` varchar(18) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `categoryID` varchar(18) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `channelID` varchar(18) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `createdBy` varchar(18) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `masterUser` varchar(18) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `tagsPerDay` tinyint NOT NULL DEFAULT '1',
  `createdOn` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `startsOn` datetime NOT NULL,
  `expiresOn` datetime NOT NULL,
  `isClosed` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

--
-- Άδειασμα δεδομένων του πίνακα `channels`
--

INSERT INTO `channels` (`id`, `guildID`, `categoryID`, `channelID`, `createdBy`, `masterUser`, `tagsPerDay`, `createdOn`, `startsOn`, `expiresOn`, `isClosed`) VALUES
(1, '840173865467641877', '841038133335293952', '842179828492009502', '839768031805702154', '839768031805702154', 1, '2021-05-12 23:21:57', '2021-05-12 23:21:57', '2021-05-12 23:22:57', 1),
(2, '840173865467641877', '841038133335293952', '842180602298892319', '839768031805702154', '839768031805702154', 1, '2021-05-12 23:25:02', '2021-05-12 23:25:02', '2021-05-15 23:26:02', 0);

-- --------------------------------------------------------

--
-- Δομή πίνακα για τον πίνακα `mods`
--

CREATE TABLE `mods` (
  `id` int NOT NULL,
  `channelID` varchar(18) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `modID` varchar(18) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `addedBy` varchar(18) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `addedOn` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- --------------------------------------------------------

--
-- Δομή πίνακα για τον πίνακα `sentpings`
--

CREATE TABLE `sentpings` (
  `id` int NOT NULL,
  `channelID` varchar(18) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `sentOn` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `sentBy` varchar(18) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- --------------------------------------------------------

--
-- Δομή πίνακα για τον πίνακα `settings`
--

CREATE TABLE `settings` (
  `guildID` varchar(18) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `closedCategoryID` varchar(18) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `publicBotChannel` varchar(18) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `privateBotChannel` varchar(18) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `owner` varchar(18) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `adminRoleID` varchar(18) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `shoppyAPIKey` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `shoppySecret` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

--
-- Άδειασμα δεδομένων του πίνακα `settings`
--

INSERT INTO `settings` (`guildID`, `closedCategoryID`, `publicBotChannel`, `privateBotChannel`, `owner`, `adminRoleID`, `isActive`, `shoppyAPIKey`, `shoppySecret`) VALUES
('469140702975098900', '829813376015925308', '469140702975098902', '761872155327070259', '191478373975982082', '', 0, '', ''),
('830004874548740116', '830045439424069662', '830004874548740119', '830007003384381440', '830004672197689396', '', 0, 'Bg8FMtrjGOyL9Pdr1FY84pC0xPp1acUtcWgASqcmsd7Oub7oBc4eY7fccE4wpMrx', '3pHyz1Ux8S9Iiy5BBMJNsBJtmnLHezgk'),
('840173865467641877', '840191495268597772', '840173865929277442', '840190808896045107', '839768031805702154', '840573658291240960', 1, 'Bg8FMtrjGOyL9Pdr1FY84pC0xPp1acUtcWgASqcmsd7Oub7oBc4eY7fccE4wpMrx', 'XdPoMfZX6YZjv6Kw');

--
-- Ευρετήρια για άχρηστους πίνακες
--

--
-- Ευρετήρια για πίνακα `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

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
-- AUTO_INCREMENT για πίνακα `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT για πίνακα `channels`
--
ALTER TABLE `channels`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT για πίνακα `mods`
--
ALTER TABLE `mods`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT για πίνακα `sentpings`
--
ALTER TABLE `sentpings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
