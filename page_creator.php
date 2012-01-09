<?php

/// Override the default 404 response.
header('HTTP/1.1 200 OK');

/// Is this a request for the normal full featured version?
if (substr($_SERVER['REQUEST_URI'], -1) !== '!') {
    /// Just send it to the main page and let the client-side JavaScript sort it out.
    require 'index.html';
    die;
}

$query = explode('/', substr($_SERVER['REQUEST_URI'], 0, -1), 2);

///TODO: The rest.
