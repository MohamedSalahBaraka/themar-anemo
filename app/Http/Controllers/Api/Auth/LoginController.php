<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class LoginController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (Auth::attempt($request->only('email', 'password'))) {
            $user = User::find(Auth::id());
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'user' => $user,
                'access_token' => $token,
                'token_type' => 'Bearer',
                'redirect_to' => $user->role === 'admin' ? '/admin/dashboard' : '/user/dashboard'
            ], Response::HTTP_OK);
        }

        return response()->json([
            'message' => 'Invalid credentials',
        ], Response::HTTP_UNAUTHORIZED);
    }

    public function destroy(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Successfully logged out'
        ], Response::HTTP_OK);
    }
}
