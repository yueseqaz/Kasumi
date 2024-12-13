<script>
const password = "sakura";

function showPasswordModal() {
  document.getElementById("passwordModal").style.display = "flex";  
}

function closeModal() {
  document.getElementById("passwordModal").style.display = "none";  
}

function checkPassword() {
  const userPass = document.getElementById("passwordInput").value;
  if (userPass === password) {
    document.getElementById("hiddenContentContainer").style.display = "block"; 
    closeModal();  
  } else {
    alert("密码错误！");
  }
}

function redirectToWebsite() {
  window.location.href = "https://www.missav.com"; 
}

window.onclick = function(event) {
  const modal = document.getElementById("passwordModal");
  if (event.target === modal) {
    closeModal();
  }
};
</script>
