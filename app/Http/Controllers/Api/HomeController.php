<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\AboutValue;
use App\Models\City;
use App\Models\Config;
use App\Models\configs;
use App\Models\Faq;
use App\Models\Package;
use App\Models\Property;
use App\Models\TeamMember;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class HomeController extends Controller
{
    public function index(Request $request)
    {
        // Featured properties
        $featuredProperties = Property::query()
            ->with(['images'])
            ->where('is_featured', true)
            ->where('status', 'available')
            ->orderBy('created_at', 'desc')
            ->limit(12)
            ->get()
            ->map(fn($property) => $this->formatProperty($property));

        // Recently viewed properties (for authenticated users)
        $recentlyViewed = Auth::check()
            ? $request->user()
            ->recentlyViewedProperties()
            ->with(['images'])
            ->limit(4)
            ->get()
            ->map(fn($property) => $this->formatMinimalProperty($property))
            : [];

        // Property counts by type
        $propertyCounts = Property::selectRaw('type, count(*) as count')
            ->where('status', 'available')
            ->groupBy('type')
            ->pluck('count', 'type');

        // Sectioned properties
        $sectionedProperties = [
            'forSale' => $this->getPropertiesByPurpose('sale', 8),
            'forRent' => $this->getPropertiesByPurpose('rent', 8),
            'popularTypes' => $this->getPropertiesByType(['apartment', 'villa', 'townhouse'], 8),
        ];

        return response()->json([
            'featuredProperties' => $featuredProperties,
            'recentlyViewed' => $recentlyViewed,
            'propertyCounts' => $propertyCounts,
            'sectionedProperties' => $sectionedProperties,
            'filterOptions' => [
                'types' => Property::distinct()->pluck('type'),
                'purposes' => ['sale', 'rent'],
            ],
            'packages' => Package::limit(3)->get(),
        ]);
    }

    public function pricing()
    {
        return response()->json([
            'packages' => Package::limit(3)->get(),
            'faqs' => Faq::orderBy('order')->get(),
            'statistics' => [
                'cities' => City::count(),
                'active_properties' => Property::where('status', 'available')->count(),
                'total_properties' => Property::count()
            ]
        ]);
    }

    public function aboutUs()
    {
        $config = configs::where('is_public', true)->pluck('value', 'key')->toArray();
        return response()->json([
            'about' => [
                'short_description' => $config['about.short'],
                'detailed_description' => $config['about.detailed'],
                'experience_years' => $config['about.static_experiance'],
                'vision' => $config['about.vision'],
                'mission' => $config['about.mission'],
                'values_intro' => $config['about.values_intro'],
                'team_phrase' => $config['about.team_catchy_phrase'],
            ],
            'values' => AboutValue::all()->map(function ($value) {
                return [
                    'icon' => asset(
                        'storage' . $value->icon
                    ),
                    'title' => $value->title,
                    'details' => $value->details
                ];
            }),
            'team_members' => TeamMember::all()->map(function ($member) {
                return [
                    'name' => $member->name,
                    'position' => $member->title,
                    'bio' => $member->bio,
                    'avatar' => asset(
                        'storage' . $member->photo
                    ),
                ];
            }),
            'contact_info' => [
                'email' => config('contact_info.email'),
                'phone' => config('contact_info.phone'),
                'address' => config('contact_info.address')
            ]
        ]);
    }

    public function faqs()
    {
        return response()->json([
            'faqs' => Faq::where('is_active', true)
                ->orderBy('order')
                ->get()
                ->groupBy('category')
        ]);
    }

    public function getConfigs()
    {
        $config = configs::where('is_public', true)->pluck('value', 'key')->toArray();
        return response()->json([
            'app' => [
                'name' => $config['app.name'],
                'logo' =>  asset('storage' . $config['app.logo_url']),
                'dark_logo' => asset('storage' . $config['app.logo_dark_url']),
                'support_email' => $config['app.support_email'],
                'default_language' => $config['app.default_language']
            ],
            'landing' => [
                'primary_phrase' => $config['landing.catchy_phrase_primary'],
                'secondary_phrase' => $config['landing.catchy_phrase_secondary'],
                'cta_primary' => $config['cta.catchy_phrase_primary'],
                'cta_secondary' => $config['cta.catchy_phrase_secondary']
            ],
            'property' => [
                'max_photos' => $config['property.max_photos'],
                'allow_edit' => $config['property.allow_edit_after_post'],
                'new_property_alerts' => $config['notifications.new_property_alerts']
            ],
            'subscription' => [
                'refund_policy' => $config['subscription.refund_policy'],
                'trial_days' => $config['subscription.trial_days']
            ]
        ]);
    }

    public function page($key)
    {
        $page = configs::where('key', 'page.' . $key)
            ->where('is_public', true)
            ->firstOrFail();

        return response()->json([
            'page' => [
                'title' => $key,
                'content' => $page->value,
                'last_updated' => $page->updated_at->toISOString()
            ]
        ]);
    }
    // Helper methods
    private function getPropertiesByPurpose($purpose, $limit)
    {
        return Property::query()
            ->with(['images'])
            ->where('status', 'available')
            ->where('purpose', $purpose)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(fn($property) => $this->formatProperty($property));
    }

    private function getPropertiesByType($types, $limit)
    {
        return Property::query()
            ->with(['images'])
            ->where('status', 'available')
            ->whereIn('type', $types)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(fn($property) => $this->formatProperty($property));
    }

    private function formatProperty($property)
    {
        return [
            'id' => $property->id,
            'title' => $property->title,
            'price' => $property->price,
            'bedrooms' => $property->bedrooms,
            'bathrooms' => $property->bathrooms,
            'area' => $property->area,
            'address' => $property->address,
            'city' => $property->city,
            'type' => $property->type,
            'purpose' => $property->purpose,
            'status' => $property->status,
            'is_featured' => $property->is_featured,
            'images' => $property->images->map(fn($image) => [
                'url' => asset('storage' . $image->image_url),
                'thumbnail' => asset(
                    'storage' . $image->thumbnail_url ?? $image->image_url
                )
            ]),
            'primary_image' => asset(
                'storage' . $property->images->first()?->image_url
            ),
            'created_at' => $property->created_at->format('Y-m-d H:i:s'),
            'coordinates' => [
                'latitude' => $property->latitude,
                'longitude' => $property->longitude
            ]
        ];
    }

    private function formatMinimalProperty($property)
    {
        return [
            'id' => $property->id,
            'title' => $property->title,
            'price' => $property->price,
            'address' => $property->address,
            'type' => $property->type,
            'primary_image' => asset(
                'storage' . $property->images->first()?->image_url
            )
        ];
    }
}
