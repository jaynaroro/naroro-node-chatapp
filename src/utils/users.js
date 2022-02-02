const users = [];

//adding users

const addUser = ({ id, username, room }) => {
  // clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  //check if Uname and room exist
  if (!username || !room) {
    return {
      error: "Username and room are required",
    };
  }

  //check for existing user
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });

  //validate the username
  if (existingUser) {
    return {
      error: "Username already exists in this room",
    };
  }

  //store the user after all validation checks

  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => {
    return user.id === id;
  });

  //remove the user
  if (index != -1) {
    return users.splice(index, 1)[0];
  }
};

//getUser function

const getUser = (id) => {
  return users.find((user) => user.id === id);
};

//getUsers in room

const getUsersInRoom = (room) => {
  room.trim().toLowerCase();
  return users.filter((user) => user.room === room);
};

module.exports = {
  addUser,
  getUser,
  removeUser,
  getUsersInRoom,
};
