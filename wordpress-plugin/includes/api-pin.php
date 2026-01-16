<?php
if (!defined('ABSPATH')) {
    exit;
}

class Tailor_Sahab_PIN_API {
    private $namespace = 'tailor-sahab/v1';
    private $resource_name = 'pin';

    public function register_routes() {
        register_rest_route($this->namespace, '/' . $this->resource_name, array(
            array(
                'methods'             => 'POST',
                'callback'            => array($this, 'handle_pin_action'),
                'permission_callback' => '__return_true',
            ),
        ));
    }

    public function handle_pin_action($request) {
        global $wpdb;
        $table_settings = $wpdb->prefix . 'tailor_settings';
        $params = $request->get_json_params();
        $action = isset($params['action']) ? sanitize_text_field($params['action']) : '';

        if ($action === 'check_exists') {
            $pin = $wpdb->get_var($wpdb->prepare(
                "SELECT setting_value FROM $table_settings WHERE setting_key = %s",
                'app_pin'
            ));
            return new WP_REST_Response(array('exists' => !empty($pin)), 200);
        }

        if ($action === 'verify') {
            $submitted_pin = isset($params['pin']) ? sanitize_text_field($params['pin']) : '';
            $stored_pin = $wpdb->get_var($wpdb->prepare(
                "SELECT setting_value FROM $table_settings WHERE setting_key = %s",
                'app_pin'
            ));

            // Default PIN if none exists (though UI encourages DB change)
            if (!$stored_pin) {
                $stored_pin = '1234'; 
                // Auto-create if not exists
                $wpdb->insert($table_settings, array(
                    'setting_key' => 'app_pin',
                    'setting_value' => $stored_pin
                ));
            }

            $success = ($submitted_pin === $stored_pin);
            return new WP_REST_Response(array('success' => $success), 200);
        }

        return new WP_Error('invalid_action', 'Invalid action', array('status' => 400));
    }
}
