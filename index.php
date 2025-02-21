<?php

$json_file = file_get_contents("student-list.json");
$json_data = json_decode($json_file);
?>
<html>
    <head>
        <script
            defer
            src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"
        ></script>
        <script
            src="https://unpkg.com/htmx.org@2.0.4"
            integrity="sha384-HGfztofotfshcF7+8n44JQL2oJmowVChPTg48S+jvZoztPfvwD79OC/LTtG6dMp+"
            crossorigin="anonymous"
        ></script>
        <script src="json.js"></script>
        <link rel="stylesheet" href="style.css" />
    </head>

    <body>
        <div id="container">
            <div id="header">
                <h3>Schalidle</h3>
            </div>
            <div id="content">
                <div class="search">
                    <input
                        x-model="search"
                        class="searchbox"
                        type="search"
                        placeholder="Type a student name to begin"
                    />
                    <ul>
                        <template
                            x-for="student in filteredItems"
                            :key="student.name"
                        >
                            <li x-text="student"></li>
                        </template>
                    </ul>
                </div>
                <div class="results">
                    <div class="row 1">
                        <div class="box"></div>
                        <div class="box"></div>
                        <div class="box"></div>
                        <div class="box"></div>
                        <div class="box"></div>
                        <div class="box"></div>
                    </div>
                    <div class="row 2">
                        <div class="box"></div>
                        <div class="box"></div>
                        <div class="box"></div>
                        <div class="box"></div>
                        <div class="box"></div>
                        <div class="box"></div>
                    </div>
                    <div class="row 3">
                        <div class="box"></div>
                        <div class="box"></div>
                        <div class="box"></div>
                        <div class="box"></div>
                        <div class="box"></div>
                        <div class="box"></div>
                    </div>
                    <div class="row 4">
                        <div class="box"></div>
                        <div class="box"></div>
                        <div class="box"></div>
                        <div class="box"></div>
                        <div class="box"></div>
                        <div class="box"></div>
                    </div>
                    <div class="row 5">
                        <div class="box"></div>
                        <div class="box"></div>
                        <div class="box"></div>
                        <div class="box"></div>
                        <div class="box"></div>
                        <div class="box"></div>
                    </div>
                    <div class="row 6">
                        <div class="box"></div>
                        <div class="box"></div>
                        <div class="box"></div>
                        <div class="box"></div>
                        <div class="box"></div>
                        <div class="box"></div>
                    </div>
                </div>
            </div>
        </div>
    </body>
</html>
