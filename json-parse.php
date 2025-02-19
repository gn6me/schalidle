<?php

$json_file = file_get_contents("student-list.json");
$json_data = json_decode($json_file);

$index = 0;

function studentName() {
  foreach ($json_data as $name) {
    $name = $json_data[$index]->name;
    echo $name, "\n";
    $index++;
  }
}

function studentSchool() {
  foreach ($json_data as $school) {
    $school = $json_data[$index]->school;
    echo $school, "\n";
    $index++;
  }
}
studentName();
?>
