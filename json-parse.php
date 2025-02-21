<?php

$json_file = file_get_contents("student-list.json");
$json_data = json_decode($json_file);

function studentName()
{
    $index = 0;
    foreach ($GLOBALS["json_data"] as $name) {
        $name = $GLOBALS["json_data"][$index]->name;
        echo $name, "\n";
        $index++;
    }
}

function studentSchool($index)
{
    $school = $GLOBALS["json_data"][$index]->school;
    echo $school;
}

function studentInfo($index)
{
    $name = $GLOBALS["json_data"]->$index->name;
    $school = $GLOBALS["json_data"]->$index->school;
    echo "Name: ", $name, "\n", "School: ", $school;
}
studentInfo("Shiroko*Terror");
?>
