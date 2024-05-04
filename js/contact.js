
(function() 
{
    emailjs.init("G76go_t7T8IWkOzPu");
})();
  
  document.getElementById('contactForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission
  
    // Manually collect the form data
    var from_name = document.getElementById('name').value;
    var from_email = document.getElementById('email').value;
    var message_html = document.getElementById('message').value;
  
    // Construct the parameters object with a predefined message
    var templateParams = {
      from_name: from_name,
      from_email: from_email,
      message: message_html, // User's message
      message_html: message_html,
    };
  
    // Send the email
    emailjs.send('service_liranandguy', 'template_mwv3uzt', templateParams)
      .then(function(response) {
        Swal.fire({
            icon: 'success',
            title: '!Success',
            text: 'Your message has been sent successfully',
            timer: 1500,
            showConfirmButton: false
        })
      }, function(error) {
        event.preventDefault();
        Swal.fire({
            icon: 'error',
            title: '...Oops',
            text: 'Please fill in all fields',
            timer: 1500,
            showConfirmButton: false
        });
      });
  });