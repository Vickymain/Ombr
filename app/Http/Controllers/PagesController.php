<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class PagesController extends Controller
{
    public function terms()
    {
        return Inertia::render('Pages/Terms');
    }

    public function privacy()
    {
        return Inertia::render('Pages/Privacy');
    }

    public function learnMore()
    {
        return Inertia::render('Pages/LearnMore');
    }
}

