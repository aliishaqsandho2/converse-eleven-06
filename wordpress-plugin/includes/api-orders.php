<?php
if (!defined('ABSPATH')) {
    exit;
}

class Tailor_Sahab_Orders_API {
    private $namespace = 'tailor-sahab/v1';
    private $resource_name = 'orders';

    public function register_routes() {
        register_rest_route($this->namespace, '/' . $this->resource_name, array(
            array(
                'methods'             => 'GET',
                'callback'            => array($this, 'get_orders'),
                'permission_callback' => '__return_true',
            ),
            array(
                'methods'             => 'POST',
                'callback'            => array($this, 'create_order'),
                'permission_callback' => '__return_true',
            ),
        ));

        register_rest_route($this->namespace, '/' . $this->resource_name . '/(?P<id>[a-zA-Z0-9-]+)', array(
            array(
                'methods'             => 'GET',
                'callback'            => array($this, 'get_order'),
                'permission_callback' => '__return_true',
            ),
            array(
                'methods'             => 'PUT',
                'callback'            => array($this, 'update_order'),
                'permission_callback' => '__return_true',
            ),
            array(
                'methods'             => 'DELETE',
                'callback'            => array($this, 'delete_order'),
                'permission_callback' => '__return_true',
            ),
        ));
    }

    public function get_orders($request) {
        global $wpdb;
        $table_orders = $wpdb->prefix . 'tailor_orders';
        $table_customers = $wpdb->prefix . 'tailor_customers';
        $status = $request->get_param('order_status');

        $query = "SELECT o.*, c.name as customer_name, c.phone as customer_phone 
                  FROM $table_orders o 
                  LEFT JOIN $table_customers c ON o.customer_id = c.id";
        
        if (!empty($status)) {
            $query .= $wpdb->prepare(" WHERE o.status = %s", $status);
        }
        
        $query .= " ORDER BY o.created_at DESC";

        $results = $wpdb->get_results($query, ARRAY_A);
        
        foreach ($results as &$row) {
            // Map status to order_status for frontend
            $row['status'] = $row['status']; // Keep original for some uses
            
            // Create nested customer object
            $row['customer'] = array(
                'id' => $row['customer_id'],
                'name' => $row['customer_name'],
                'phone' => $row['customer_phone']
            );
            
            // Clean up root level customer fields
            unset($row['customer_name']);
            unset($row['customer_phone']);

            // Convert decimals
            $row['price'] = $row['price'] !== null ? (float)$row['price'] : null;
            $row['advance_payment'] = $row['advance_payment'] !== null ? (float)$row['advance_payment'] : null;
        }

        return new WP_REST_Response($results, 200);
    }

    public function get_order($request) {
        global $wpdb;
        $table_orders = $wpdb->prefix . 'tailor_orders';
        $table_customers = $wpdb->prefix . 'tailor_customers';
        $id = $request['id'];

        $order = $wpdb->get_row($wpdb->prepare(
            "SELECT o.*, c.name as customer_name, c.phone as customer_phone 
             FROM $table_orders o 
             LEFT JOIN $table_customers c ON o.customer_id = c.id 
             WHERE o.id = %s", 
            $id
        ), ARRAY_A);

        if (!$order) {
            return new WP_Error('not_found', 'Order not found', array('status' => 404));
        }

        // Create nested customer object
        $order['customer'] = array(
            'id' => $order['customer_id'],
            'name' => $order['customer_name'],
            'phone' => $order['customer_phone']
        );
        
        unset($order['customer_name']);
        unset($order['customer_phone']);

        $order['price'] = $order['price'] !== null ? (float)$order['price'] : null;
        $order['advance_payment'] = $order['advance_payment'] !== null ? (float)$order['advance_payment'] : null;

        return new WP_REST_Response($order, 200);
    }

    public function create_order($request) {
        global $wpdb;
        $table_orders = $wpdb->prefix . 'tailor_orders';
        $params = $request->get_json_params();

        if (empty($params['customer_id']) || empty($params['order_number'])) {
            return new WP_Error('missing_fields', 'Customer ID and Order Number are required', array('status' => 400));
        }

        $id = isset($params['id']) ? sanitize_text_field($params['id']) : wp_generate_uuid4();
        
        $data = array(
            'id' => $id,
            'customer_id' => sanitize_text_field($params['customer_id']),
            'order_number' => sanitize_text_field($params['order_number']),
            'description' => isset($params['description']) ? sanitize_textarea_field($params['description']) : null,
            'fabric_details' => isset($params['fabric_details']) ? sanitize_textarea_field($params['fabric_details']) : null,
            'price' => isset($params['price']) ? (float)$params['price'] : 0,
            'advance_payment' => isset($params['advance_payment']) ? (float)$params['advance_payment'] : 0,
            'status' => isset($params['order_status']) ? sanitize_text_field($params['order_status']) : 'pending',
            'delivery_date' => isset($params['delivery_date']) ? sanitize_text_field($params['delivery_date']) : null,
        );

        $inserted = $wpdb->insert($table_orders, $data);

        if ($inserted === false) {
            return new WP_Error('db_error', 'Could not create order', array('status' => 500));
        }

        return new WP_REST_Response(array('id' => $id), 201);
    }

    public function update_order($request) {
        global $wpdb;
        $table_orders = $wpdb->prefix . 'tailor_orders';
        $id = $request['id'];
        $params = $request->get_json_params();

        $data = array();
        
        // Frontend uses order_status key
        if (isset($params['order_status'])) {
            $data['status'] = sanitize_text_field($params['order_status']);
        }
        
        // Add other fields if present (for potential future full updates)
        $fields = array('description', 'fabric_details', 'price', 'advance_payment', 'delivery_date');
        foreach ($fields as $field) {
            if (isset($params[$field])) {
                if ($field === 'price' || $field === 'advance_payment') {
                    $data[$field] = (float)$params[$field];
                } else {
                    $data[$field] = sanitize_text_field($params[$field]);
                }
            }
        }

        if (empty($data)) {
            return new WP_REST_Response(array('success' => true), 200);
        }

        $updated = $wpdb->update($table_orders, $data, array('id' => $id));

        if ($updated === false) {
            return new WP_Error('db_error', 'Could not update order', array('status' => 500));
        }

        return new WP_REST_Response(array('success' => true), 200);
    }

    public function delete_order($request) {
        global $wpdb;
        $table_orders = $wpdb->prefix . 'tailor_orders';
        $id = $request['id'];

        $deleted = $wpdb->delete($table_orders, array('id' => $id));

        if ($deleted === false) {
            return new WP_Error('db_error', 'Could not delete order', array('status' => 500));
        }

        return new WP_REST_Response(array('success' => true), 200);
    }
}
