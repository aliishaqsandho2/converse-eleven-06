<?php
if (!defined('ABSPATH')) {
    exit;
}

class Tailor_Sahab_Customers_API {
    private $namespace = 'tailor-sahab/v1';
    private $resource_name = 'customers';

    public function register_routes() {
        register_rest_route($this->namespace, '/' . $this->resource_name, array(
            array(
                'methods'             => 'GET',
                'callback'            => array($this, 'get_customers'),
                'permission_callback' => '__return_true',
            ),
            array(
                'methods'             => 'POST',
                'callback'            => array($this, 'create_customer'),
                'permission_callback' => '__return_true',
            ),
        ));

        register_rest_route($this->namespace, '/' . $this->resource_name . '/(?P<id>[a-zA-Z0-9-]+)', array(
            array(
                'methods'             => 'GET',
                'callback'            => array($this, 'get_customer'),
                'permission_callback' => '__return_true',
            ),
            array(
                'methods'             => 'PUT',
                'callback'            => array($this, 'update_customer'),
                'permission_callback' => '__return_true',
            ),
            array(
                'methods'             => 'DELETE',
                'callback'            => array($this, 'delete_customer'),
                'permission_callback' => '__return_true',
            ),
        ));
    }

    public function get_customers($request) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'tailor_customers';
        $search = $request->get_param('search');

        if (!empty($search)) {
            $query = $wpdb->prepare(
                "SELECT * FROM $table_name WHERE name LIKE %s OR phone LIKE %s ORDER BY created_at DESC",
                '%' . $wpdb->esc_like($search) . '%',
                '%' . $wpdb->esc_like($search) . '%'
            );
        } else {
            $query = "SELECT * FROM $table_name ORDER BY created_at DESC";
        }

        $results = $wpdb->get_results($query, ARRAY_A);
        
        // Convert decimals to floats/numbers for frontend consistency
        foreach ($results as &$row) {
            foreach ($row as $key => $value) {
                if (is_numeric($value) && strpos($key, '_length') !== false || in_array($key, ['chest', 'neck', 'waist', 'gher', 'collar_size', 'cuff_width', 'placket_width', 'armhole', 'elbow', 'daman', 'bain', 'paicha', 'shalwar_width'])) {
                    $row[$key] = $value !== null ? (float)$value : null;
                }
            }
        }

        return new WP_REST_Response($results, 200);
    }

    public function get_customer($request) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'tailor_customers';
        $id = $request['id'];

        $customer = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name WHERE id = %s", $id), ARRAY_A);

        if (!$customer) {
            return new WP_Error('not_found', 'Customer not found', array('status' => 404));
        }

        // Convert decimals
        foreach ($customer as $key => $value) {
            if (is_numeric($value) && (strpos($key, '_length') !== false || in_array($key, ['chest', 'neck', 'waist', 'gher', 'collar_size', 'cuff_width', 'placket_width', 'armhole', 'elbow', 'daman', 'bain', 'paicha', 'shalwar_width']))) {
                $customer[$key] = $value !== null ? (float)$value : null;
            }
        }

        return new WP_REST_Response($customer, 200);
    }

    public function create_customer($request) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'tailor_customers';
        $params = $request->get_json_params();

        if (empty($params['name'])) {
            return new WP_Error('missing_name', 'Name is required', array('status' => 400));
        }

        $id = isset($params['id']) ? sanitize_text_field($params['id']) : wp_generate_uuid4();
        
        $data = array(
            'id' => $id,
            'name' => sanitize_text_field($params['name']),
            'phone' => isset($params['phone']) ? sanitize_text_field($params['phone']) : null,
            'notes' => isset($params['notes']) ? sanitize_textarea_field($params['notes']) : null,
            'front_pocket' => isset($params['front_pocket']) ? sanitize_text_field($params['front_pocket']) : null,
            'side_pocket' => isset($params['side_pocket']) ? sanitize_text_field($params['side_pocket']) : null,
            'shalwar_pocket' => isset($params['shalwar_pocket']) ? sanitize_text_field($params['shalwar_pocket']) : null,
        );

        // Measurement fields
        $measurements = array(
            'qameez_length', 'sleeve_length', 'chest', 'neck', 'waist', 'gher', 
            'collar_size', 'cuff_width', 'placket_width', 'armhole', 'elbow', 
            'daman', 'bain', 'shalwar_length', 'paicha', 'shalwar_width'
        );

        foreach ($measurements as $field) {
            $data[$field] = isset($params[$field]) ? (float)$params[$field] : null;
        }

        $inserted = $wpdb->insert($table_name, $data);

        if ($inserted === false) {
            return new WP_Error('db_error', 'Could not create customer', array('status' => 500));
        }

        return new WP_REST_Response(array('id' => $id), 201);
    }

    public function update_customer($request) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'tailor_customers';
        $id = $request['id'];
        $params = $request->get_json_params();

        $data = array();
        $fields_to_sanitize = array('name', 'phone', 'front_pocket', 'side_pocket', 'shalwar_pocket');
        foreach ($fields_to_sanitize as $field) {
            if (isset($params[$field])) {
                $data[$field] = sanitize_text_field($params[$field]);
            }
        }

        if (isset($params['notes'])) {
            $data['notes'] = sanitize_textarea_field($params['notes']);
        }

        $measurements = array(
            'qameez_length', 'sleeve_length', 'chest', 'neck', 'waist', 'gher', 
            'collar_size', 'cuff_width', 'placket_width', 'armhole', 'elbow', 
            'daman', 'bain', 'shalwar_length', 'paicha', 'shalwar_width'
        );

        foreach ($measurements as $field) {
            if (isset($params[$field])) {
                $data[$field] = $params[$field] !== null ? (float)$params[$field] : null;
            }
        }

        $updated = $wpdb->update($table_name, $data, array('id' => $id));

        if ($updated === false) {
            return new WP_Error('db_error', 'Could not update customer', array('status' => 500));
        }

        return new WP_REST_Response(array('success' => true), 200);
    }

    public function delete_customer($request) {
        global $wpdb;
        $table_customers = $wpdb->prefix . 'tailor_customers';
        $table_orders = $wpdb->prefix . 'tailor_orders';
        $id = $request['id'];

        // Delete orders first
        $wpdb->delete($table_orders, array('customer_id' => $id));
        
        $deleted = $wpdb->delete($table_customers, array('id' => $id));

        if ($deleted === false) {
            return new WP_Error('db_error', 'Could not delete customer', array('status' => 500));
        }

        return new WP_REST_Response(array('success' => true), 200);
    }
}
