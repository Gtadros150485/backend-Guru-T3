SELECT
    c.name AS client_name,
    SUM(oi.quantity * oi.price_at_order_time) AS total_sum
FROM clients c
JOIN orders o ON o.client_id = c.id
JOIN order_items oi ON oi.order_id = o.id
GROUP BY c.name;