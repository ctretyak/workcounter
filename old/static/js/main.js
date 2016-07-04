$(function() {
    $('.end.hours').val(new Date().getHours());
    $('.end.minutes').val(new Date().getMinutes());
    $('.timeinput')[0].focus();
});

$('.timeinput').on('keyup', function(e) {
    if (this.value.match(/[^\d,]/g, '')) {
        this.value = this.value.replace(/[^\d,]/g, '');
    }
    $(this).change();
});

$('.hours').on('change', function() {
    var value = $(this).val();
    if (value > 23) {
        $(this).val(23);
    }
    if (value < 0) {
        $(this).val(0);
    }
    doResult();
});
$('.minutes').on('change', function() {
    var value = $(this).val();
    if (value > 59) {
        $(this).val(59);
    }
    if (value < 0) {
        $(this).val(0);
    }
    doResult();
});

$('.clear_btn').on('click', function() {
    $('.timeinput').val('');
    doResult();
    $('.timeinput')[0].focus();
});
$('.copy_btn').on('click', function() {
    window.prompt('Скопировать в буфер: Ctrl+C, Enter', $('.result').val());
});

function doResult() {
    var canResult = true;
    $('.timeinput').each(function() {
        if ($(this).val().length == 0) {
            canResult = false;
        }
    });
    if (!canResult) {
        $('.result').val('Не подсчитано');
    } else {
        var start = parseFloat($('.start.hours').val()) + parseFloat($('.start.minutes').val()) / 60;
        var end = parseFloat($('.end.hours').val()) + parseFloat($('.end.minutes').val()) / 60;
        if (end < start) {
            end += 24;
        }
        var result = end - start;
        $('.result').val(result.toFixed(2));
    }
}