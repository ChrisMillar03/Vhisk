INSERT INTO roles (`guild`, `role_k`, `role_v`) VALUES (%guild%, %role_k%, %role_v%) ON DUPLICATE KEY UPDATE role_v=%role_v%;
