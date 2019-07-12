$(document).ready(function(){
    $(".filter-table").on("keyup", function() {
        console.log($(this).val().toLowerCase());
        if ($(this).val().toLowerCase() === '') {
            $("table tbody tr").show();
            return true;
        }
        var value = '- ' + $(this).val().toLowerCase() + ' -';
        $("table tbody tr").filter(function() {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });
});