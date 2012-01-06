<?php

/// Override the default 404 response.
header('HTTP/1.1 200 OK');

$URLstr = substr($_SERVER['REQUEST_URI'], strlen(pathinfo($_SERVER['PHP_SELF'], PATHINFO_DIRNAME)) + 1);
$query = explode('/', $URLstr, 3);

/// Is this a request for the normal full featured version?
if ($query[0] !== '!') {
    /// Just send it to the main page and let the client-side JavaScript sort it out.
    require 'index.html';
    die;
}

///TODO: The rest.
