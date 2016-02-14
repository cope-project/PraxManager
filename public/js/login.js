/*
 * Login page javascript code
 */

$(document).ready(function () {
	
	// login
    $form = $('#loginbox');
    $email = $form.find('#login-username');
    $password = $form.find('#login-password');
    
    $form.find('#btn-login').on('click', function (event) {
	event.preventDefault();
	$.post('/auth/login', {email: $email.val(), password: $password.val()})
	.success(function (data){
	    if(data.logedin){
		
		if(data.type == 'student'){
		    window.location = '/student';
		}else{
		    window.location = '/';
		}
	    }else{
		$('#login-alert').show();
	    }
	})
    });
    
    // reset password
    $('#forgot').click(function (e) {
	e.preventDefault();
	$form.hide();
	$('#resetbox').show();
    });
    
    
    $('#btn-reset').click(function (e) {
	$.post('/auth/reset_password', {email: $('#reset-email').val()})
	.success(function (data){
	    if(data.password_reseted){
			$('#reset-success').show();
		}
	}).error(function () {
		$('#reset-alert').show();
	});
    });
});
