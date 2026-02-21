SET search_path TO app;
SELECT m.nik, m.name, COUNT(ms.id) as total_scores
FROM "Mustahik" m
LEFT JOIN "SkorMustahik" ms ON m.nik = ms."mustahikId"
GROUP BY m.nik, m.name
ORDER BY m.name
LIMIT 15;
