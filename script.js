const API_KEY = "YOUR_API_KEY";

fetch(`https://api.buttercms.com/v2/pages/*/home/?auth_token=${a1665f49e7a5f6aadbd45066a68e36bd646b8a46}`)
  .then(res => res.json())
  .then(data => {
    document.getElementById("title").innerText = data.data.fields.title;
  });