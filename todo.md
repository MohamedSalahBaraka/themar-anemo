46.202.194.29
-- 1. Service Categories
Schema::create('service_categories', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('icon')->nullable();
    $table->timestamps();
});

-- 2. Services
Schema::create('services', function (Blueprint $table) {
    $table->id();
    $table->foreignId('category_id')->constrained('service_categories')->onDelete('set null')->nullable();
    $table->string('name');
    $table->text('description')->nullable();
    $table->json('tags')->nullable();
    $table->decimal('price', 10, 2)->nullable();
    $table->boolean('is_active')->default(true);
    $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
    $table->timestamps();
});

-- 3. Service Steps
Schema::create('service_steps', function (Blueprint $table) {
    $table->id();
    $table->foreignId('service_id')->constrained('services')->onDelete('cascade');
    $table->string('title');
    $table->text('description')->nullable();
    $table->unsignedInteger('order')->default(0);
    $table->unsignedInteger('deadline_days')->nullable();
    $table->timestamps();
});

-- 4. Service Fields
Schema::create('service_fields', function (Blueprint $table) {
    $table->id();
    $table->foreignId('service_id')->constrained('services')->onDelete('cascade');
    $table->foreignId('step_id')->nullable()->constrained('service_steps')->onDelete('cascade');
    $table->string('label');
    $table->string('field_type');
    $table->boolean('required')->default(false);
    $table->boolean('show_on_creation')->default(false);
    $table->json('options')->nullable();
    $table->unsignedInteger('order')->default(0);
    $table->json('dependency')->nullable(); // NEW: to store logic like {"field_id": 12, "value": "Yes"}
    $table->timestamps();
});

-- 5. User Services
Schema::create('user_services', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
    $table->foreignId('service_id')->constrained('services')->onDelete('cascade');
    $table->string('status')->default('pending');
    $table->foreignId('current_step_id')->nullable()->constrained('service_steps')->onDelete('set null');
    $table->timestamps();
});

-- 6. User Service Field Values
Schema::create('user_service_field_values', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_service_id')->constrained('user_services')->onDelete('cascade');
    $table->foreignId('service_field_id')->constrained('service_fields')->onDelete('cascade');
    $table->text('value')->nullable();
    $table->timestamps();
});

-- 7. User Service Steps
Schema::create('user_service_steps', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_service_id')->constrained('user_services')->onDelete('cascade');
    $table->foreignId('service_step_id')->constrained('service_steps')->onDelete('cascade');
    $table->string('status')->default('pending');
    $table->text('admin_note')->nullable();
    $table->timestamp('completed_at')->nullable();
    $table->timestamps();
});

-- 8. User Service Attachments
Schema::create('user_service_attachments', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_service_id')->constrained('user_services')->onDelete('cascade');
    $table->foreignId('step_id')->nullable()->constrained('service_steps')->onDelete('cascade');
    $table->foreignId('uploaded_by')->constrained('users')->onDelete('cascade');
    $table->string('file_path');
    $table->string('type')->nullable();
    $table->text('note')->nullable();
    $table->timestamps();
});

-- 9. Service Activity Logs
Schema::create('service_activity_logs', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_service_id')->constrained('user_services')->onDelete('cascade');
    $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
    $table->string('action');
    $table->json('meta')->nullable();
    $table->timestamps();
});

-- 10. User Service Reviews
Schema::create('user_service_reviews', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_service_id')->constrained('user_services')->onDelete('cascade');
    $table->unsignedTinyInteger('rating');
    $table->text('review')->nullable();
    $table->boolean('is_public')->default(true);
    $table->timestamps();
});

