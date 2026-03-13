<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link rel="icon" type="image/png" href="{{ Vite::asset('resources/js/assets/A.png') }}">
    <link rel="apple-touch-icon" href="{{ Vite::asset('resources/js/assets/A.png') }}">
    <!-- <meta http-equiv="X-UA-Compatible" content="ie=edge"> -->
    @viteReactRefresh
    @vite('resources/js/app.jsx')
    @inertiaHead
</head>
<body>
    @inertia
    <!-- <div id="app"></div> -->
</body>
</html>