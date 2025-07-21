// Safer DOM manipulation to prevent XSS vulnerabilities
const appElement = document.getElementById("app");
if (appElement) {
  const paragraph = document.createElement("p");
  paragraph.textContent = "Built with love by Kitso.";
  appElement.appendChild(paragraph);
}
