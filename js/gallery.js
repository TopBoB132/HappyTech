document.addEventListener('DOMContentLoaded', function() {
    var myModal = new bootstrap.Modal(document.getElementById('galleryModal'));
    var modalImage = document.getElementById('modalImage');
  
    document.querySelectorAll('.card').forEach(item => {
      item.addEventListener('click', event => {
        modalImage.src = item.querySelector('.card-img-top').src;
        myModal.show();
      });
    });
});