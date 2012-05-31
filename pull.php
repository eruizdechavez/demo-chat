<?php
`./pull.sh`;
file_put_contents('pull.log', 'Last Update: ' . date('r') . "\n", FILE_APPEND);
