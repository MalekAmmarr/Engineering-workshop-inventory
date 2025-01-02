$(document).ready(() => {
    $.get("/api/data", (data) => {
        $("#data").html(JSON.stringify(data));
    });
});



  