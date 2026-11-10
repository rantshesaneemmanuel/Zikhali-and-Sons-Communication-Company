<?php

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    header("Location: contacts.html");
    exit;
}

// Receive form information
$name = trim($_POST["name"] ?? "");
$email = trim($_POST["email"] ?? "");
$subject = trim($_POST["subject"] ?? "");
$message = trim($_POST["message"] ?? "");

// Check that all fields are completed
if ($name === "" || $email === "" || $subject === "" || $message === "") {
    exit("Please complete all the fields.");
}

// Validate email address
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    exit("Please enter a valid email address.");
}

// Prevent email header injection
if (preg_match("/[\r\n]/", $email)) {
    exit("Invalid email address.");
}

// YOUR EMAIL ADDRESS
$to = "rantshesaneeemanuel@gmail.com";

// Email subject
$mailSubject = "Website Enquiry: " . $subject;

// Email content
$mailMessage =
    "You have received a new message from your website.\n\n" .
    "Name: " . $name . "\n" .
    "Email: " . $email . "\n" .
    "Subject: " . $subject . "\n\n" .
    "Message:\n" . $message;

// Email headers
$headers = "From: Website Enquiries <noreply@yourdomain.com>\r\n";
$headers .= "Reply-To: " . $email . "\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

// Send email
if (mail($to, $mailSubject, $mailMessage, $headers)) {
    header("Location: contacts.html?status=success");
    exit;
} else {
    header("Location: contacts.html?status=error");
    exit;
}

?>