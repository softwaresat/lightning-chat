function askNotificationPermission() {
  // function to actually ask the permissions
  function handlePermission(permission) {
    // set the button to shown or hidden, depending on what the user answers

    notificationBtn = document.getElementById("enable");

    if(Notification.permission === 'denied' || Notification.permission === 'default') {
      notificationBtn.style.display = 'block';
    } else {
      notificationBtn.style.display = 'none';
    }
  }

  // Let's check if the browser supports notifications
  if (!('Notification' in window)) {
    console.log("This browser does not support notifications.");
  } else {
    if(checkNotificationPromise()) {
      Notification.requestPermission()
      .then((permission) => {
        handlePermission(permission);
      })
    } else {
      Notification.requestPermission(function(permission) {
        handlePermission(permission);
      });
    }
  }
}

function checkNotificationPromise() {
    try {
      Notification.requestPermission().then();
    } catch(e) {
      return false;
    }

    return true;
  }

function createNotification(user) {

  if (!document.hasFocus()) {
    var img = '../static/lightning-512.png';
    var text = user + ' sent a message on Lightning!';
    var notification = new Notification('Lightning Chat', { body: text, icon: img });

    notification.onclick = function() {
                         window.parent.focus();
                         notification.close();
                        }
  }
}