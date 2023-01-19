SELECT Sum(CASE positive WHEN 1 THEN 1 ELSE 0 END) AS pos, Sum(CASE positive WHEN 0 THEN 1 ELSE 0 END) AS neg FROM reviews WHERE user=%user%;
