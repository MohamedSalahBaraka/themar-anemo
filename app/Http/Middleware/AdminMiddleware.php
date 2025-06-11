<?php
// app/Http/Middleware/AdminMiddleware.php
namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!Auth::check() || !User::find(Auth::id())->isAdmin()) {
            abort(403, 'Unauthorized action.');
        }

        return $next($request);
    }
}
