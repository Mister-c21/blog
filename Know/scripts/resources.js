document.addEventListener('DOMContentLoaded', () => {
    // Lógica dos Dropdowns
    const dropdownHeaders = document.querySelectorAll(".dropdown-header");
    dropdownHeaders.forEach(header => {
        header.addEventListener("click", function() {
            this.classList.toggle("active");
            const content = this.nextElementSibling;
            if (content.classList.contains("show")) {
                content.classList.remove("show");
                content.style.maxHeight = null;
                content.style.padding = "0 20px";
            } else {
                content.classList.add("show");
                content.style.maxHeight = content.scrollHeight + "px";
                content.style.padding = "15px 20px";
            }
        });
    });
});


