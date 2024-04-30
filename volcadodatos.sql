--
-- Volcado de datos para las tablas de mediamaster
--

/*

CREATE TABLE `lists` (
  `list_id` int NOT NULL,
  `creator_id` int DEFAULT NULL,
  `list_name` varchar(255) DEFAULT NULL,
  `movie_id` mediumtext,
  `serie_id` mediumtext,
  `book_id` mediumtext,
  `game_id` mediumtext
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
*/

INSERT INTO `users` (`user_mail`, `user_name`, `user_password`) VALUES
('pau@maestre.es', 'paumafe', 'P@ssw0rd');

INSERT INTO `lists` (`creator_id`, `list_name`, `movie_id`, `serie_id`)
VALUES (2, 'My Test List', '11,333339', '100757,66732,580');

INSERT INTO `lists` (`creator_id`, `list_name`, `movie_id`, `serie_id`)
VALUES (2, 'My Test List2', '12,333340', '30991,66733');
