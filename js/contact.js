const form = document.getElementById('contactForm');

form.addEventListener('submit', function (event) {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    if (name === '' || email === '' || message === '') {
        event.preventDefault();
        Swal.fire({
            icon: 'error',
            title: '...Oops',
            text: 'Please fill in all fields',
            timer: 1500
        });
    } else {
        event.preventDefault(); // Prevent default form submission
        Swal.fire({
            icon: 'success',
            title: '!Success',
            text: 'Your message has been sent successfully',
            timer: 1500
        }).then((result) => {
            // If "OK" is clicked on the success message, submit the form
            if (result.isConfirmed) {
                form.submit();
            }
        });
    }
});
