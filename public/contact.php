<?php
// Receives the homepage contact form and emails it to the School Hub inbox.
// The address lives only here, server-side, so it never appears in the page.

const TO = 'hello@getschoolhub.com';
const FROM = 'hello@getschoolhub.com';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function reply(int $code, bool $ok): void {
    http_response_code($code);
    echo json_encode(['ok' => $ok]);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') reply(405, false);

$data = json_decode(file_get_contents('php://input') ?: '', true);
if (!is_array($data)) reply(400, false);

// Hidden field real visitors never see; bots that fill it get a silent "ok".
if (!empty($data['website'])) reply(200, true);

// One line, no control characters, bounded length.
function field(array $d, string $key, int $max = 200): string {
    $v = is_string($d[$key] ?? null) ? $d[$key] : '';
    $v = preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $v) ?? '';
    return mb_substr(trim($v), 0, $max);
}

$name     = field($data, 'name');
$school   = field($data, 'school');
$email    = field($data, 'email');
$phone    = field($data, 'phone', 40);
$campuses = field($data, 'campuses', 10);

if ($name === '' || $school === '' || strlen($phone) < 7 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    reply(422, false);
}

$subject = 'Demo request: ' . $school;
$body = "New demo request from getschoolhub.com\n\n"
      . "Name:     $name\n"
      . "School:   $school\n"
      . "Email:    $email\n"
      . "Phone:    $phone\n"
      . 'Campuses: ' . ($campuses !== '' ? $campuses : '-') . "\n\n"
      . 'Sent: ' . gmdate('Y-m-d H:i') . " UTC\n";

$headers = implode("\r\n", [
    'From: School Hub Website <' . FROM . '>',
    'Reply-To: ' . $email,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
]);

$sent = mail(TO, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, $headers, '-f' . FROM);
reply($sent ? 200 : 502, $sent);
