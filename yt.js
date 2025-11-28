$('#all_way').click(allthing);
$('#on_way').click(way);
$('#picture').click(picture);
$('#first').click(first);
$('#totalk').click(talktalk);
$('#date').click(annivesary);
$('#all-place').show();
$('#onway').hide();
$('#pic').hide();
$('#first_pic').hide();
$('#talk').hide();
$('#annivesary').hide();
function allthing(){
    $('#onway').show();
    $('#pic').show();
    $('#first_pic').show();
    $('#annivesary').show();
    $('#talk').show();
}
function way(){
    
    $('#onway').show();
    $('#pic').hide();
    $('#first_pic').hide();
    $('#annivesary').hide();
    $('#talk').hide();
}
function picture(){
    
    $('#onway').hide();
    $('#pic').show();
    $('#first_pic').hide();
    $('#annivesary').hide();
    $('#talk').hide();
}
function first(){
    
    $('#onway').hide();
    $('#pic').hide();
    $('#first_pic').show();
    $('#annivesary').hide();
    $('#talk').hide();
}
function annivesary(){
    $('#onway').hide();
    $('#pic').hide();
    $('#first_pic').hide();
    $('#annivesary').show();
    $('#talk').hide();
}
function talktalk(){
    $('#onway').hide();
    $('#pic').hide();
    $('#first_pic').hide();
    $('#annivesary').hide();
    $('#talk').show();
}
