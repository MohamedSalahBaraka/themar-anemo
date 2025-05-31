<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ConfigSeeder extends Seeder
{
    public function run()
    {
        $configs = [
            // Property Settings
            [
                'key' => 'property.require_approval',
                'value' => 'true',
                'type' => 'boolean',
                'description' => 'Require admin approval before properties are listed',
                'group' => 'property',
                'is_public' => false,
            ],
            [
                'key' => 'property.max_photos',
                'value' => '12',
                'type' => 'number',
                'description' => 'Maximum number of photos per property',
                'group' => 'property',
                'is_public' => true,
            ],
            [
                'key' => 'property.allow_edit_after_post',
                'value' => 'true',
                'type' => 'boolean',
                'description' => 'Allow users to edit properties after posting',
                'group' => 'property',
                'is_public' => true,
            ],
            [
                'key' => 'property.auto_archive_days',
                'value' => '90',
                'type' => 'number',
                'description' => 'Days after which inactive listings are auto-archived',
                'group' => 'property',
                'is_public' => false,
            ],

            // Subscription Settings
            [
                'key' => 'subscription.allow_change_before_end',
                'value' => 'true',
                'type' => 'boolean',
                'description' => 'Allow plan change before expiry',
                'group' => 'subscription',
                'is_public' => false,
            ],
            [
                'key' => 'subscription.refund_policy',
                'value' => 'days',
                'type' => 'enum',
                'options' => json_encode(['days', 'cash', 'none']),
                'description' => 'Refund method on early cancelation',
                'group' => 'subscription',
                'is_public' => true,
            ],
            [
                'key' => 'subscription.default_plan_id',
                'value' => '1',
                'type' => 'number',
                'description' => 'The default plan for new users',
                'group' => 'subscription',
                'is_public' => false,
            ],
            [
                'key' => 'subscription.trial_days',
                'value' => '7',
                'type' => 'number',
                'description' => 'Number of trial days before payment is required',
                'group' => 'subscription',
                'is_public' => true,
            ],

            // Notification Settings
            [
                'key' => 'notifications.email_enabled',
                'value' => 'true',
                'type' => 'boolean',
                'description' => 'Send email notifications',
                'group' => 'notifications',
                'is_public' => false,
            ],
            [
                'key' => 'notifications.sms_enabled',
                'value' => 'false',
                'type' => 'boolean',
                'description' => 'Send SMS notifications',
                'group' => 'notifications',
                'is_public' => false,
            ],
            [
                'key' => 'notifications.new_property_alerts',
                'value' => 'true',
                'type' => 'boolean',
                'description' => 'Notify users of new properties matching their interests',
                'group' => 'notifications',
                'is_public' => true,
            ],

            // Website/App Settings
            [
                'key' => 'app.name',
                'value' => 'My Real Estate App',
                'type' => 'text',
                'description' => 'App name (brand name)',
                'group' => 'app',
                'is_public' => true,
            ],
            [
                'key' => 'app.url',
                'value' => 'https://yourdomain.com',
                'type' => 'link',
                'description' => 'Main site URL',
                'group' => 'app',
                'is_public' => true,
            ],
            [
                'key' => 'app.support_email',
                'value' => 'support@yourdomain.com',
                'type' => 'text',
                'description' => 'Support contact email',
                'group' => 'app',
                'is_public' => true,
            ],
            [
                'key' => 'app.maintenance_mode',
                'value' => 'false',
                'type' => 'boolean',
                'description' => 'Show maintenance page',
                'group' => 'app',
                'is_public' => true,
            ],
            [
                'key' => 'app.default_language',
                'value' => 'en',
                'type' => 'enum',
                'options' => json_encode(['en', 'ar']),
                'description' => 'Default app language',
                'group' => 'app',
                'is_public' => true,
            ],
            [
                'key' => 'app.logo_url',
                'value' => '/images/logo.png',
                'type' => 'link',
                'description' => 'URL to app logo',
                'group' => 'app',
                'is_public' => true,
            ],

            // Security & Privacy Settings
            [
                'key' => 'security.enable_recaptcha',
                'value' => 'true',
                'type' => 'boolean',
                'description' => 'Enable Google reCAPTCHA on forms',
                'group' => 'security',
                'is_public' => false,
            ],
            [
                'key' => 'security.failed_login_limit',
                'value' => '5',
                'type' => 'number',
                'description' => 'Max failed login attempts before blocking',
                'group' => 'security',
                'is_public' => false,
            ],
            [
                'key' => 'security.block_time_minutes',
                'value' => '30',
                'type' => 'number',
                'description' => 'Block duration after max failed logins',
                'group' => 'security',
                'is_public' => false,
            ],
            [
                'key' => 'privacy.show_email_in_listing',
                'value' => 'false',
                'type' => 'boolean',
                'description' => 'Show user email on public listings',
                'group' => 'privacy',
                'is_public' => true,
            ],
            [
                'key' => 'app.logo_dark_url',
                'value' => '',
                'type' => 'link',
                'description' => 'Dark mode logo URL',
                'group' => 'app',
                'is_public' => true,
            ],
        ];

        foreach ($configs as $config) {
            DB::table('configs')->updateOrInsert(
                ['key' => $config['key']],
                $config
            );
        }
    }
}
