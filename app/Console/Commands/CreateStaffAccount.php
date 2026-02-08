<?php

namespace App\Console\Commands;

use App\Models\Staffs;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class CreateStaffAccount extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'staff:create {--firstname=} {--lastname=} {--email=} {--password=} {--role=staff}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a new staff account with hashed password';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $firstname = $this->option('firstname') ?? $this->ask('First name');
        $lastname = $this->option('lastname') ?? $this->ask('Last name');
        $email = $this->option('email') ?? $this->ask('Email');
        $password = $this->option('password') ?? $this->secret('Password (min 8 characters)');
        $role = $this->option('role') ?? $this->choice('Role', ['admin', 'staff', 'manager'], 1);

        if (strlen($password) < 8) {
            $this->error('Password must be at least 8 characters long');
            return 1;
        }

        try {
            $staff = Staffs::create([
                'staff_firstname' => $firstname,
                'staff_lastname' => $lastname,
                'staff_email' => $email,
                'staff_password' => $password, // Will be automatically hashed by the model
                'staff_role' => $role,
                'staff_contact' => '',
                'staff_status' => 'active'
            ]);

            $this->info('Staff account created successfully!');
            $this->table(
                ['Staff ID', 'Name', 'Email', 'Role', 'Status'],
                [[
                    str_pad($staff->staff_id, 5, '0', STR_PAD_LEFT),
                    "$firstname $lastname",
                    $email,
                    $role,
                    'active'
                ]]
            );

            return 0;
        } catch (\Exception $e) {
            $this->error('Error creating staff account: ' . $e->getMessage());
            return 1;
        }
    }
}
