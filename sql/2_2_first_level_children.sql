SELECT
    p.id AS parent_category_id,
    p.name AS parent_category_name,
    COUNT(c.id) AS first_level_children_count
FROM categories p
LEFT JOIN categories c ON c.parent_id = p.id
WHERE p.parent_id IS NULL
GROUP BY p.id, p.name;