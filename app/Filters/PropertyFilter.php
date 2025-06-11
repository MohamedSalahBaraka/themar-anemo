<?php

namespace App\Filters;

use Illuminate\Database\Eloquent\Builder;

class PropertyFilter
{
    protected $filters;

    public function __construct(array $filters)
    {
        $this->filters = $filters;
    }

    public function __invoke(Builder $query)
    {
        return $query
            ->when($this->filters['type'] ?? null, fn($q, $type) => $q->where('type', $type))
            ->when($this->filters['purpose'] ?? null, fn($q, $purpose) => $q->where('purpose', $purpose))
            ->when($this->filters['city'] ?? null, fn($q, $city) => $q->where('city_id',  $city))
            ->when($this->filters['minPrice'] ?? null, fn($q, $min) => $q->where('price', '>=', $min))
            ->when($this->filters['maxPrice'] ?? null, fn($q, $max) => $q->where('price', '<=', $max))
            ->when($this->filters['bedrooms'] ?? null, fn($q, $beds) => $q->where('bedrooms', '>=', $beds))
            ->when($this->filters['status'] ?? null, fn($q, $status) => $q->where('status', $status));
    }
}
