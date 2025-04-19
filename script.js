document.addEventListener('DOMContentLoaded', function() {
  // ======================
  // COMMON FUNCTIONALITY
  // ======================
  
  // Mobile menu toggle
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const mainNav = document.querySelector('.main-nav');
  
  if (mobileMenuToggle && mainNav) {
    mobileMenuToggle.addEventListener('click', function() {
      mainNav.classList.toggle('active');
      this.querySelector('i').classList.toggle('fa-times');
      this.querySelector('i').classList.toggle('fa-bars');
    });
    
    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.main-nav a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (mainNav.classList.contains('active')) {
          mainNav.classList.remove('active');
          mobileMenuToggle.querySelector('i').classList.toggle('fa-times');
          mobileMenuToggle.querySelector('i').classList.toggle('fa-bars');
        }
      });
    });
  }

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: 'smooth'
        });
      }
    });
  });

  // Add shadow to header on scroll
  window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    if (header) {
      if (window.scrollY > 50) {
        header.style.boxShadow = '0 2px 15px rgba(0, 0, 0, 0.1)';
      } else {
        header.style.boxShadow = 'none';
      }
    }
  });

  // ======================
  // COUNTDOWN TIMER (For May 9th)
  // ======================
  function updateCountdown() {
    const now = new Date();
    // Set the webinar date to May 9th of the current year at 10:00 AM IST
    const webinarDate = new Date(now.getFullYear(), 4, 9, 10, 0, 0); // Note: Month is 0-indexed (4 = May)
    
    // If May 9th has already passed this year, set it for next year
    if (now > webinarDate) {
      webinarDate.setFullYear(now.getFullYear() + 1);
    }
    
    const diff = webinarDate - now;
    
    // Calculate time remaining
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    // Update the DOM elements if they exist
    if (document.getElementById('days')) {
      document.getElementById('days').textContent = days.toString().padStart(2, '0');
    }
    if (document.getElementById('hours')) {
      document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
    }
    if (document.getElementById('minutes')) {
      document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
    }
    if (document.getElementById('seconds')) {
      document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
    }
    
    // If countdown is over, show a message
    if (diff <= 0) {
      if (document.getElementById('timer')) {
        document.getElementById('timer').innerHTML = '<span class="event-started">The webinar has started!</span>';
      }
      return;
    }
  }

  // Initialize countdown timer if on the page with timer
  if (document.getElementById('timer')) {
    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  // ======================
  // REGISTRATION FORM (index.html)
  // ======================
  const registrationForm = document.getElementById("registration-form");
  if (registrationForm) {
    registrationForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const form = e.target;
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      data.email = data.email.toLowerCase().trim();

      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = "Registering...";

      try {
        // 1) Send registration to your backend on Render
        const response = await fetch("https://registraion-site-backend.onrender.com/api/registrations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const result = await response.json();

        if (response.ok && result.success) {
          // 2) On success, save to localStorage & redirect
          localStorage.setItem("registrationData", JSON.stringify(data));
          window.location.href = "payment.html";
        } else {
          throw new Error(result.error || "Registration failed");
        }
      } catch (err) {
        console.error("Registration Error:", err);
        alert(err.message);
        submitBtn.disabled = false;
        submitBtn.textContent = "Pay ₹49 & Register";
      }
    });

    // Add input validation
    const emailInput = registrationForm.querySelector('input[name="email"]');
    const phoneInput = registrationForm.querySelector('input[name="phone"]');
    
    if (emailInput) {
      emailInput.addEventListener('blur', function() {
        if (!this.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
          this.classList.add('invalid');
        } else {
          this.classList.remove('invalid');
        }
      });
    }
    
    if (phoneInput) {
      phoneInput.addEventListener('blur', function() {
        if (!this.value.match(/^[0-9]{10}$/)) {
          this.classList.add('invalid');
        } else {
          this.classList.remove('invalid');
        }
      });
    }
  }

  // ======================
  // PAYMENT FORM (payment.html)
  // ======================
  const uploadForm = document.getElementById("upload-form");
  if (uploadForm) {
    uploadForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const stored = localStorage.getItem("registrationData");
      if (!stored) {
        alert("Please complete registration first");
        return window.location.href = "index.html";
      }

      const registrationData = JSON.parse(stored);
      const formData = new FormData(this);
      formData.append("email", registrationData.email);

      const submitBtn = this.querySelector("button[type='submit']");
      submitBtn.disabled = true;
      submitBtn.textContent = "Uploading...";

      try {
        const response = await fetch("https://registraion-site-backend.onrender.com/api/upload", {
          method: "POST",
          body: formData,
        });
        const result = await response.json();

        if (response.ok && result.success) {
          localStorage.removeItem("registrationData");
          window.location.href = result.whatsappLink || "wp.html";
        } else {
          throw new Error(result.error || "Payment verification failed");
        }
      } catch (err) {
        console.error("Upload Error:", err);
        alert(err.message);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Payment Proof";
      }
    });

    // Screenshot preview
    const screenshotInput = document.getElementById("screenshot");
    const previewImg = document.getElementById("preview");
    if (screenshotInput && previewImg) {
      screenshotInput.addEventListener("change", function () {
        const file = this.files[0];
        if (!file) {
          previewImg.style.display = "none";
          previewImg.src = "";
          return;
        }
        
        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validTypes.includes(file.type)) {
          alert("Please upload an image file (JPEG, PNG, GIF)");
          this.value = "";
          return;
        }
        
        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
          alert("Image must be less than 2MB");
          this.value = "";
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
          previewImg.src = e.target.result;
          previewImg.style.display = "block";
        };
        reader.readAsDataURL(file);
      });
    }

    // Back to Registration
    const backBtn = document.querySelector(".back-btn");
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        window.location.href = "index.html";
      });
    }
  }

  // ======================
  // ADDITIONAL FEATURES
  // ======================
  // Sticky Footer
  const footer = document.querySelector("footer");
  if (footer) {
    const footerHeight = footer.offsetHeight;
    document.body.style.paddingBottom = `${footerHeight}px`;
  }
});
