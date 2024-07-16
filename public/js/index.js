var text = "NINE";
var length = text.length;
var speed = 200;

function typeWriter() {
    if (i < length) {
        var span = document.createElement("span");
        span.textContent = text.charAt(i);
        span.classList.add("rainbow");
        document.getElementById("text").appendChild(span);
        i++;
        setTimeout(typeWriter, speed);
    }
}

var i = 0;
typeWriter();

// Player Name
function button1(event) {
    event.preventDefault();
    var name = document.querySelector('input[name="name"]').value;
    window.location.href = "game.html?name=" + encodeURIComponent(name);
}