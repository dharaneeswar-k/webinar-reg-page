document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById("registration-form");
  
    if (form) {
      form.addEventListener("submit", async function (e) {
        e.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        data.email = data.email.toLowerCase().trim();
  
        const btn = form.querySelector("button");
        btn.disabled = true;
        btn.textContent = "Registering...";
  
        try {
          const response = await fetch("https://registraion-site-backend.onrender.com/api/registrations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
          });
  
          const result = await response.json();
  
          if (response.ok && result.success) {
            alert("Registration successful! Redirecting to WhatsApp group...");
            // ✅ Redirect to your WhatsApp group
            window.location.href = "https://chat.whatsapp.com/Hwt92wEtzCMFpHhmZh0dFk";
          } else {
            throw new Error(result.error || "Something went wrong");
          }
        } catch (err) {
          alert("Registration failed: " + err.message);
        } finally {
          btn.disabled = false;
          btn.textContent = "Register Free";
        }
      });
    }
  });
  
