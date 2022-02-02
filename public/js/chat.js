const socket = io();

//Elements
const $messageForm = document.querySelector("#message-form");
const $messageInput = $messageForm.querySelector("input");
const $messageButton = $messageForm.querySelector("button");
const $shareLocation = document.querySelector("#share-location");
const $messages = document.querySelector("#messages");
const $location = document.querySelector("#location");

//templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

//options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

//////////////////////////////////////////////////////////////////////////////////////////
//
const autoscroll = () => {
  //new message Element
  const $newMessage = $messages.lastElementChild;

  //Height of the new Message
  const newMessageStyle = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyle.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  //visibleHeight
  const visibleHeight = $messages.offsetHeight;

  //containerHeight
  const containerHeight = $messages.scrollHeight;

  //distance scrolled
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
socket.on("message", (message) => {
  console.log(message.text);
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("h : mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("locationMessage", (locationURL) => {
  console.log(locationURL);

  const html = Mustache.render(locationTemplate, {
    username: locationURL.username,
    locationURL: locationURL.text,
    createdAt: moment(locationURL.createdAt).format("h : mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room: room,
    users: users,
  });
  document.querySelector("#sidebar").innerHTML = html;
});

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();

  //disable the form here ....
  $messageButton.setAttribute("disabled", "disabled");

  const message = e.target.elements.message.value;

  socket.emit("sendMessage", message, (error) => {
    //enable here.....
    $messageButton.removeAttribute("disabled");
    $messageInput.value = "";
    $messageInput.focus();

    if (error) {
      return console.log(error);
    }

    console.log("Message Delivered");
  });
});

$shareLocation.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by the current browser");
  }

  $shareLocation.setAttribute("disabled", "disabled");
  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "sendLocation",
      {
        Latitude: position.coords.latitude,
        Longitude: position.coords.longitude,
      },
      (error) => {
        $shareLocation.removeAttribute("disabled");
        if (error) {
          return console.log(error);
        }

        console.log("Location Sent");
      }
    );
  });
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
